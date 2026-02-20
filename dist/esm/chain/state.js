/**
 * Chain State Management
 * Single source of truth for document chain
 */
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ChainStateManager_instances, _ChainStateManager_documents, _ChainStateManager_lastHash, _ChainStateManager_clock, _ChainStateManager_detectedForks, _ChainStateManager_forkCacheValid, _ChainStateManager_detectFork, _ChainStateManager_rebuildForkCache;
import { Blake2b } from '../crypto/blake2b.js';
import { NewZoneCoreError } from '../types.js';
import { ERROR_CODES } from '../constants.js';
import { LogicalClock } from '../identity/logical-time.js';
export class ChainStateManager {
    constructor(chainId, initialTime = 1) {
        _ChainStateManager_instances.add(this);
        _ChainStateManager_documents.set(this, new Map());
        _ChainStateManager_lastHash.set(this, '0'.repeat(64));
        _ChainStateManager_clock.set(this, void 0);
        _ChainStateManager_detectedForks.set(this, new Map());
        _ChainStateManager_forkCacheValid.set(this, false);
        this.chainId = chainId;
        __classPrivateFieldSet(this, _ChainStateManager_clock, new LogicalClock(initialTime), "f");
    }
    /**
     * Append document to chain
     */
    append(document) {
        // Verify chain ID
        if (document.chain_id !== this.chainId) {
            throw new NewZoneCoreError(ERROR_CODES.VALIDATION_FAILED, 'Document chain ID mismatch', { expected: this.chainId, got: document.chain_id });
        }
        // Verify parent hash and detect forks
        if (document.parent_hash !== __classPrivateFieldGet(this, _ChainStateManager_lastHash, "f")) {
            __classPrivateFieldGet(this, _ChainStateManager_instances, "m", _ChainStateManager_detectFork).call(this, document);
        }
        // Store document
        __classPrivateFieldGet(this, _ChainStateManager_documents, "f").set(document.id, document);
        // Update last hash
        __classPrivateFieldSet(this, _ChainStateManager_lastHash, document.id, "f");
        // Invalidate fork cache - documents changed
        __classPrivateFieldSet(this, _ChainStateManager_forkCacheValid, false, "f");
        // Advance logical time
        __classPrivateFieldGet(this, _ChainStateManager_clock, "f").tick();
    }
    /**
     * Get document by ID
     */
    getDocument(id) {
        return __classPrivateFieldGet(this, _ChainStateManager_documents, "f").get(id);
    }
    /**
     * Get last document hash
     */
    getLastHash() {
        return __classPrivateFieldGet(this, _ChainStateManager_lastHash, "f");
    }
    /**
     * Get logical clock
     */
    get clock() {
        return __classPrivateFieldGet(this, _ChainStateManager_clock, "f");
    }
    /**
     * Get document count
     */
    get length() {
        return __classPrivateFieldGet(this, _ChainStateManager_documents, "f").size;
    }
    /**
     * Get all documents
     * Note: For large chains, use getDocumentsPaginated() instead
     */
    get documents() {
        return Array.from(__classPrivateFieldGet(this, _ChainStateManager_documents, "f").values());
    }
    /**
     * Get documents with pagination
     * More efficient for large chains
     */
    getDocumentsPaginated(options) {
        const limit = options?.limit ?? 100;
        const offset = options?.offset ?? 0;
        const sortBy = options?.sortBy ?? 'logical_time';
        const sortOrder = options?.sortOrder ?? 'asc';
        const allDocuments = Array.from(__classPrivateFieldGet(this, _ChainStateManager_documents, "f").values());
        // Sort documents
        allDocuments.sort((a, b) => {
            const aVal = a[sortBy];
            const bVal = b[sortBy];
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
            }
            const aStr = String(aVal);
            const bStr = String(bVal);
            return sortOrder === 'asc'
                ? aStr.localeCompare(bStr)
                : bStr.localeCompare(aStr);
        });
        const total = allDocuments.length;
        const documents = allDocuments.slice(offset, offset + limit);
        const hasMore = offset + limit < total;
        return {
            documents,
            total,
            hasMore
        };
    }
    /**
     * Get documents by type with pagination
     */
    getDocumentsByType(type, options) {
        const limit = options?.limit ?? 100;
        const offset = options?.offset ?? 0;
        const allDocuments = Array.from(__classPrivateFieldGet(this, _ChainStateManager_documents, "f").values())
            .filter(doc => doc.type === type)
            .sort((a, b) => a.logical_time - b.logical_time);
        const total = allDocuments.length;
        const documents = allDocuments.slice(offset, offset + limit);
        const hasMore = offset + limit < total;
        return {
            documents,
            total,
            hasMore
        };
    }
    /**
     * Get detected forks (cached)
     * Returns cached result unless documents changed
     */
    get forks() {
        if (!__classPrivateFieldGet(this, _ChainStateManager_forkCacheValid, "f")) {
            // Rebuild cache from current documents
            __classPrivateFieldGet(this, _ChainStateManager_detectedForks, "f").clear();
            __classPrivateFieldGet(this, _ChainStateManager_instances, "m", _ChainStateManager_rebuildForkCache).call(this);
            __classPrivateFieldSet(this, _ChainStateManager_forkCacheValid, true, "f");
        }
        return Array.from(__classPrivateFieldGet(this, _ChainStateManager_detectedForks, "f").values());
    }
    /**
     * Get chain state
     */
    getState() {
        return {
            chainId: this.chainId,
            lastHash: __classPrivateFieldGet(this, _ChainStateManager_lastHash, "f"),
            logicalClock: __classPrivateFieldGet(this, _ChainStateManager_clock, "f").current,
            documentCount: __classPrivateFieldGet(this, _ChainStateManager_documents, "f").size,
            forks: this.forks
        };
    }
    /**
     * Verify chain integrity
     */
    verifyIntegrity() {
        let prevHash = '0'.repeat(64);
        // Sort by logical time
        const sorted = Array.from(__classPrivateFieldGet(this, _ChainStateManager_documents, "f").values())
            .sort((a, b) => a.logical_time - b.logical_time);
        for (const doc of sorted) {
            // Check parent chain
            if (doc.parent_hash !== prevHash) {
                return false;
            }
            // Verify hash chain using unified document hash computation
            const computedHash = Blake2b.computeDocumentHash(doc.chain_id, doc.parent_hash, doc.logical_time, doc.payload);
            if (computedHash !== doc.id) {
                return false;
            }
            prevHash = doc.id;
        }
        return true;
    }
    /**
     * Reset chain state
     */
    reset() {
        __classPrivateFieldGet(this, _ChainStateManager_documents, "f").clear();
        __classPrivateFieldSet(this, _ChainStateManager_lastHash, '0'.repeat(64), "f");
        __classPrivateFieldGet(this, _ChainStateManager_detectedForks, "f").clear();
        __classPrivateFieldSet(this, _ChainStateManager_forkCacheValid, false, "f");
    }
    /**
     * Export state for persistence
     */
    export() {
        const state = {
            chainId: this.chainId,
            lastHash: __classPrivateFieldGet(this, _ChainStateManager_lastHash, "f"),
            clock: __classPrivateFieldGet(this, _ChainStateManager_clock, "f").toJSON(),
            documents: Array.from(__classPrivateFieldGet(this, _ChainStateManager_documents, "f").entries()),
            forks: Array.from(__classPrivateFieldGet(this, _ChainStateManager_detectedForks, "f").entries())
        };
        return new TextEncoder().encode(JSON.stringify(state));
    }
    /**
     * Import state from persistence
     */
    static import(data, chainId) {
        const state = JSON.parse(new TextDecoder().decode(data));
        if (state.chainId !== chainId) {
            throw new NewZoneCoreError(ERROR_CODES.VALIDATION_FAILED, 'Chain ID mismatch during import');
        }
        const manager = new ChainStateManager(chainId, state.clock.logical_clock);
        __classPrivateFieldSet(manager, _ChainStateManager_lastHash, state.lastHash, "f");
        for (const [id, doc] of state.documents) {
            __classPrivateFieldGet(manager, _ChainStateManager_documents, "f").set(id, doc);
        }
        for (const [hash, fork] of state.forks) {
            __classPrivateFieldGet(manager, _ChainStateManager_detectedForks, "f").set(hash, fork);
        }
        return manager;
    }
}
_ChainStateManager_documents = new WeakMap(), _ChainStateManager_lastHash = new WeakMap(), _ChainStateManager_clock = new WeakMap(), _ChainStateManager_detectedForks = new WeakMap(), _ChainStateManager_forkCacheValid = new WeakMap(), _ChainStateManager_instances = new WeakSet(), _ChainStateManager_detectFork = function _ChainStateManager_detectFork(document) {
    // Find other documents with same parent
    const siblings = Array.from(__classPrivateFieldGet(this, _ChainStateManager_documents, "f").values())
        .filter(d => d.parent_hash === document.parent_hash);
    if (siblings.length > 0) {
        const forkInfo = {
            parentHash: document.parent_hash,
            documents: [...siblings.map(d => d.id), document.id],
            detectedAt: __classPrivateFieldGet(this, _ChainStateManager_clock, "f").current,
            resolved: false
        };
        __classPrivateFieldGet(this, _ChainStateManager_detectedForks, "f").set(document.parent_hash, forkInfo);
    }
}, _ChainStateManager_rebuildForkCache = function _ChainStateManager_rebuildForkCache() {
    const parentMap = new Map();
    // Group documents by parent_hash
    for (const doc of __classPrivateFieldGet(this, _ChainStateManager_documents, "f").values()) {
        const parentHash = doc.parent_hash;
        const existing = parentMap.get(parentHash) || [];
        parentMap.set(parentHash, [...existing, doc]);
    }
    // Detect forks (multiple children of same parent)
    for (const [parentHash, children] of parentMap.entries()) {
        if (children.length > 1) {
            __classPrivateFieldGet(this, _ChainStateManager_detectedForks, "f").set(parentHash, {
                parentHash,
                documents: children.map(d => d.id),
                detectedAt: Math.max(...children.map(d => d.logical_time)),
                resolved: false
            });
        }
    }
};
//# sourceMappingURL=state.js.map