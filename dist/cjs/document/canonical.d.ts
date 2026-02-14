/**
 * RFC 8785 JSON Canonicalization Scheme
 */
export declare class CanonicalJSON {
    /**
     * Serialize object to canonical JSON
     */
    static serialize(obj: unknown): Promise<string>;
    static parse(canonicalString: string): Promise<unknown>;
    static assertCanonical(jsonString: string): Promise<void>;
    static isCanonical(jsonString: string): Promise<boolean>;
    static canonicalize<T>(obj: T): Promise<T>;
    static prepareForSigning(doc: Record<string, unknown>): Promise<string>;
    static canonicalEqual(a: unknown, b: unknown): Promise<boolean>;
    static hash(obj: unknown): Promise<Uint8Array>;
    static pretty(obj: unknown): string;
}
//# sourceMappingURL=canonical.d.ts.map