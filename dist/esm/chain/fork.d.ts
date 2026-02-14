/**
 * Fork Detection Model
 * Core MUST detect forks
 * Core MUST NOT resolve forks automatically
 */
import { Document, ForkInfo } from '../types.js';
export declare class ForkDetector {
    /**
     * Scan documents for forks
     * Multiple documents with same parent_hash = fork
     */
    static scan(documents: Document[]): ForkInfo[];
    /**
     * Create merge document (resolution document)
     * MUST reference both conflicting hashes
     */
    static createMergeDocument(conflictHashes: string[], resolution: Record<string, unknown>): Partial<Document>;
    /**
     * Check if fork is still active
     */
    static isForkActive(fork: ForkInfo, currentDocuments: Document[]): boolean;
    /**
     * Resolve fork (manual process)
     * Core provides detection, application resolves
     */
    static resolveFork(fork: ForkInfo, resolutionDocId: string): ForkInfo;
    /**
     * Get fork statistics
     */
    static getStats(forks: ForkInfo[]): {
        total: number;
        resolved: number;
        active: number;
    };
    /**
     * Find fork by parent hash
     */
    static findByParent(forks: ForkInfo[], parentHash: string): ForkInfo | undefined;
    /**
     * Find forks involving document
     */
    static findByDocument(forks: ForkInfo[], documentId: string): ForkInfo[];
}
//# sourceMappingURL=fork.d.ts.map