/**
 * Fork Detection Model
 * Core MUST detect forks
 * Core MUST NOT resolve forks automatically
 */
import { NewZoneCoreError } from '../types.js';
import { ERROR_CODES } from '../constants.js';
export class ForkDetector {
    /**
     * Scan documents for forks
     * Multiple documents with same parent_hash = fork
     */
    static scan(documents) {
        const parentMap = new Map();
        const forks = [];
        // Group by parent_hash
        for (const doc of documents) {
            const parentHash = doc.parent_hash;
            const existing = parentMap.get(parentHash) || [];
            parentMap.set(parentHash, [...existing, doc]);
        }
        // Detect forks (multiple children of same parent)
        for (const [parentHash, children] of parentMap.entries()) {
            if (children.length > 1) {
                forks.push({
                    parentHash,
                    documents: children.map(d => d.id),
                    detectedAt: Math.max(...children.map(d => d.logical_time)),
                    resolved: false
                });
            }
        }
        // Sort by detection time
        return forks.sort((a, b) => a.detectedAt - b.detectedAt);
    }
    /**
     * Create merge document (resolution document)
     * MUST reference both conflicting hashes
     */
    static createMergeDocument(conflictHashes, resolution) {
        if (conflictHashes.length < 2) {
            throw new NewZoneCoreError(ERROR_CODES.FORK_DETECTED, 'Merge requires at least 2 conflicting hashes', { count: conflictHashes.length });
        }
        return {
            type: 'merge',
            version: '1.0',
            merges: conflictHashes,
            resolution,
            // MUST NOT mark as automatically resolved
            automaticallyResolved: false
        };
    }
    /**
     * Check if fork is still active
     */
    static isForkActive(fork, currentDocuments) {
        const currentIds = new Set(currentDocuments.map(d => d.id));
        // Удалить currentHashes - он не используется
        // Fork is active if both branches still exist
        let activeCount = 0;
        for (const docId of fork.documents) {
            if (currentIds.has(docId)) {
                activeCount++;
            }
            // Also check if any document references these branches
            for (const doc of currentDocuments) {
                if (fork.documents.includes(doc.parent_hash)) {
                    activeCount++;
                }
            }
        }
        return activeCount > 1;
    }
    /**
     * Resolve fork (manual process)
     * Core provides detection, application resolves
     */
    static resolveFork(fork, resolutionDocId) {
        return {
            ...fork,
            resolved: true,
            resolution: resolutionDocId
        };
    }
    /**
     * Get fork statistics
     */
    static getStats(forks) {
        const resolved = forks.filter(f => f.resolved).length;
        return {
            total: forks.length,
            resolved,
            active: forks.length - resolved
        };
    }
    /**
     * Find fork by parent hash
     */
    static findByParent(forks, parentHash) {
        return forks.find(f => f.parentHash === parentHash);
    }
    /**
     * Find forks involving document
     */
    static findByDocument(forks, documentId) {
        return forks.filter(f => f.documents.includes(documentId));
    }
}
