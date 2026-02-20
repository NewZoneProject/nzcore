/**
 * RFC 8785 JSON Canonicalization Scheme
 */
export declare class CanonicalJSON {
    /**
     * Serialize object to canonical JSON
     */
    static serialize(obj: unknown): string;
    static parse(canonicalString: string): unknown;
    static assertCanonical(jsonString: string): void;
    static isCanonical(jsonString: string): boolean;
    static canonicalize<T>(obj: T): T;
    static prepareForSigning(doc: Record<string, unknown>): string;
    static canonicalEqual(a: unknown, b: unknown): boolean;
    static hash(obj: unknown): Uint8Array;
    static pretty(obj: unknown): string;
}
//# sourceMappingURL=canonical.d.ts.map