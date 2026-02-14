/**
 * NewZoneCore - Main Implementation
 * Personal autonomous Root of Trust
 */
import { Document, DocumentPayload, ValidationResult, ChainState, ForkInfo, NewZoneCoreOptions, NewZoneCoreInstance } from './types.js';
export declare class NewZoneCore implements NewZoneCoreInstance {
    #private;
    constructor(mnemonic: string, options?: NewZoneCoreOptions);
    /**
     * Статический фабричный метод для асинхронного создания
     */
    static create(mnemonic: string, options?: NewZoneCoreOptions): Promise<NewZoneCore>;
    /**
     * Асинхронная инициализация
     */
    private initialize;
    /**
     * Create a new document
     * Core API: deterministic, no wall-clock dependencies
     */
    createDocument(type: string, payload?: DocumentPayload): Promise<Document>;
    /**
     * Verify document
     * Core API: returns validation result with all layers
     */
    verifyDocument(document: Document): Promise<ValidationResult>;
    /**
     * Get current chain state
     * Core API: deterministic snapshot
     */
    getChainState(): ChainState;
    /**
     * Detect forks
     * Core API: MUST NOT attempt automatic resolution
     */
    detectFork(): ForkInfo[];
    /**
     * Export identity (for backup)
     * Returns mnemonic only - no other state
     */
    exportIdentity(): {
        mnemonic: string;
        chainId: string;
    };
    /**
     * Export chain state (for persistence)
     */
    exportState(): Uint8Array;
    /**
     * Import chain state
     */
    importState(state: Uint8Array): void;
    /**
     * Get public key
     */
    getPublicKey(): Uint8Array;
    /**
     * Get public key as hex
     */
    getPublicKeyHex(): string;
    /**
     * Get chain ID
     */
    getChainId(): string;
    /**
     * Check if initialized
     */
    private assertInitialized;
    /**
     * Securely destroy instance
     * Zeroizes private key material
     */
    destroy(): void;
}
//# sourceMappingURL=core.d.ts.map