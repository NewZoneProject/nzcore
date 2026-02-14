/**
 * RFC 8785 JSON Canonicalization Scheme
 */
let canonicalize;
async function loadCanonicalize() {
    if (!canonicalize) {
        const module = await import('canonicalize');
        canonicalize = module.default || module;
    }
    return canonicalize;
}
import { NewZoneCoreError } from '../types.js';
import { ERROR_CODES } from '../constants.js';
import { constantTimeStringEqual } from '../utils/zeroize.js';
export class CanonicalJSON {
    /**
     * Serialize object to canonical JSON
     */
    static async serialize(obj) {
        try {
            const canon = await loadCanonicalize();
            const result = canon(obj);
            if (result === undefined) {
                throw new Error('Canonicalization failed');
            }
            return result;
        }
        catch (e) {
            throw new NewZoneCoreError(ERROR_CODES.NON_CANONICAL_JSON, 'Failed to serialize to canonical JSON', { error: e });
        }
    }
    static async parse(canonicalString) {
        await this.assertCanonical(canonicalString);
        try {
            return JSON.parse(canonicalString);
        }
        catch (e) {
            throw new NewZoneCoreError(ERROR_CODES.NON_CANONICAL_JSON, 'Invalid JSON', { error: e });
        }
    }
    static async assertCanonical(jsonString) {
        try {
            const obj = JSON.parse(jsonString);
            const recanonicalized = await this.serialize(obj);
            if (!constantTimeStringEqual(jsonString, recanonicalized)) {
                throw new NewZoneCoreError(ERROR_CODES.NON_CANONICAL_JSON, 'Non-canonical JSON: MUST reject before signature verification');
            }
        }
        catch (e) {
            if (e instanceof NewZoneCoreError)
                throw e;
            throw new NewZoneCoreError(ERROR_CODES.NON_CANONICAL_JSON, 'Invalid JSON structure', { error: e });
        }
    }
    static async isCanonical(jsonString) {
        try {
            await this.assertCanonical(jsonString);
            return true;
        }
        catch {
            return false;
        }
    }
    static async canonicalize(obj) {
        const canonical = await this.serialize(obj);
        return JSON.parse(canonical);
    }
    static async prepareForSigning(doc) {
        const docWithoutSig = { ...doc };
        delete docWithoutSig.signature;
        return await this.serialize(docWithoutSig);
    }
    static async canonicalEqual(a, b) {
        const aCanonical = await this.serialize(a);
        const bCanonical = await this.serialize(b);
        return constantTimeStringEqual(aCanonical, bCanonical);
    }
    static async hash(obj) {
        const canonical = await this.serialize(obj);
        return new TextEncoder().encode(canonical);
    }
    static pretty(obj) {
        return JSON.stringify(obj, null, 2);
    }
}
