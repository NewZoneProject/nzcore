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
var _ChainStateManager_instances, _ChainStateManager_documents, _ChainStateManager_lastHash, _ChainStateManager_clock, _ChainStateManager_detectedForks, _ChainStateManager_detectFork, _ChainStateManager_computeDocumentHash;
import { Blake2b } from '../crypto/blake2b.js';
import { toHex, mergeArrays } from '../utils/encoding.js';
import { NewZoneCoreError } from '../types.js';
import { ERROR_CODES } from '../constants.js';
import { LogicalClock } from '../identity/logical-time.js';
import { KEY_LENGTHS } from '../constants.js';
export class ChainStateManager {
    constructor(chainId, initialTime = 1) {
        _ChainStateManager_instances.add(this);
        _ChainStateManager_documents.set(this, new Map());
        _ChainStateManager_lastHash.set(this, '0'.repeat(64));
        _ChainStateManager_clock.set(this, void 0);
        _ChainStateManager_detectedForks.set(this, new Map());
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
        // Verify parent hash
        if (document.parent_hash !== __classPrivateFieldGet(this, _ChainStateManager_lastHash, "f")) {
            // Check if this creates a fork
            __classPrivateFieldGet(this, _ChainStateManager_instances, "m", _ChainStateManager_detectFork).call(this, document);
        }
        // Store document
        __classPrivateFieldGet(this, _ChainStateManager_documents, "f").set(document.id, document);
        // Update last hash
        __classPrivateFieldSet(this, _ChainStateManager_lastHash, document.id, "f");
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
     */
    get documents() {
        return Array.from(__classPrivateFieldGet(this, _ChainStateManager_documents, "f").values());
    }
    /**
     * Get detected forks
     */
    get forks() {
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
            // Verify hash chain
            const computedHash = __classPrivateFieldGet(this, _ChainStateManager_instances, "m", _ChainStateManager_computeDocumentHash).call(this, doc);
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
_ChainStateManager_documents = new WeakMap(), _ChainStateManager_lastHash = new WeakMap(), _ChainStateManager_clock = new WeakMap(), _ChainStateManager_detectedForks = new WeakMap(), _ChainStateManager_instances = new WeakSet(), _ChainStateManager_detectFork = function _ChainStateManager_detectFork(document) {
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
}, _ChainStateManager_computeDocumentHash = function _ChainStateManager_computeDocumentHash(doc) {
    const data = mergeArrays(new TextEncoder().encode(doc.chain_id), new TextEncoder().encode(doc.parent_hash), new Uint8Array(new Uint32Array([doc.logical_time]).buffer), new TextEncoder().encode(JSON.stringify(doc.payload || {})));
    const hash = Blake2b.doubleHash(data);
    return toHex(hash.slice(0, KEY_LENGTHS.DOCUMENT_ID));
};
//# sourceMappingURL=state.js.map