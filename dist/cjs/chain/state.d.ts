/**
 * Chain State Management
 * Single source of truth for document chain
 */
import { Document, ChainState, ForkInfo } from '../types.js';
import { LogicalClock } from '../identity/logical-time.js';
export declare class ChainStateManager {
    #private;
    readonly chainId: string;
    constructor(chainId: string, initialTime?: number);
    /**
     * Append document to chain
     */
    append(document: Document): void;
    /**
     * Get document by ID
     */
    getDocument(id: string): Document | undefined;
    /**
     * Get last document hash
     */
    getLastHash(): string;
    /**
     * Get logical clock
     */
    get clock(): LogicalClock;
    /**
     * Get document count
     */
    get length(): number;
    /**
     * Get all documents
     */
    get documents(): Document[];
    /**
     * Get detected forks (cached)
     * Returns cached result unless documents changed
     */
    get forks(): ForkInfo[];
    /**
     * Get chain state
     */
    getState(): ChainState;
    /**
     * Verify chain integrity
     */
    verifyIntegrity(): boolean;
    /**
     * Reset chain state
     */
    reset(): void;
    /**
     * Export state for persistence
     */
    export(): Uint8Array;
    /**
     * Import state from persistence
     */
    static import(data: Uint8Array, chainId: string): ChainStateManager;
}
//# sourceMappingURL=state.d.ts.map