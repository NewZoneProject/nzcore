"use strict";
/**
 * RFC 8785 JSON Canonicalization Scheme
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanonicalJSON = void 0;
const canonicalize_1 = __importDefault(require("canonicalize"));
const types_js_1 = require("../types.js");
const constants_js_1 = require("../constants.js");
const zeroize_js_1 = require("../utils/zeroize.js");
class CanonicalJSON {
    /**
     * Serialize object to canonical JSON
     */
    static serialize(obj) {
        try {
            const result = (0, canonicalize_1.default)(obj);
            if (result === undefined) {
                throw new Error('Canonicalization failed');
            }
            return result;
        }
        catch (e) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.NON_CANONICAL_JSON, 'Failed to serialize to canonical JSON', { error: e });
        }
    }
    static parse(canonicalString) {
        this.assertCanonical(canonicalString);
        try {
            return JSON.parse(canonicalString);
        }
        catch (e) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.NON_CANONICAL_JSON, 'Invalid JSON', { error: e });
        }
    }
    static assertCanonical(jsonString) {
        try {
            const obj = JSON.parse(jsonString);
            const recanonicalized = this.serialize(obj);
            if (!(0, zeroize_js_1.constantTimeStringEqual)(jsonString, recanonicalized)) {
                throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.NON_CANONICAL_JSON, 'Non-canonical JSON: MUST reject before signature verification');
            }
        }
        catch (e) {
            if (e instanceof types_js_1.NewZoneCoreError)
                throw e;
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.NON_CANONICAL_JSON, 'Invalid JSON structure', { error: e });
        }
    }
    static isCanonical(jsonString) {
        try {
            this.assertCanonical(jsonString);
            return true;
        }
        catch {
            return false;
        }
    }
    static canonicalize(obj) {
        const canonical = this.serialize(obj);
        return JSON.parse(canonical);
    }
    static prepareForSigning(doc) {
        const docWithoutSig = { ...doc };
        delete docWithoutSig.signature;
        return this.serialize(docWithoutSig);
    }
    static canonicalEqual(a, b) {
        const aCanonical = this.serialize(a);
        const bCanonical = this.serialize(b);
        return (0, zeroize_js_1.constantTimeStringEqual)(aCanonical, bCanonical);
    }
    static hash(obj) {
        const canonical = this.serialize(obj);
        return new TextEncoder().encode(canonical);
    }
    static pretty(obj) {
        return JSON.stringify(obj, null, 2);
    }
}
exports.CanonicalJSON = CanonicalJSON;
//# sourceMappingURL=canonical.js.map