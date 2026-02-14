"use strict";
/**
 * RFC 8785 JSON Canonicalization Scheme
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanonicalJSON = void 0;
let canonicalize;
async function loadCanonicalize() {
    if (!canonicalize) {
        const module = await Promise.resolve().then(() => __importStar(require('canonicalize')));
        canonicalize = module.default || module;
    }
    return canonicalize;
}
const types_js_1 = require("../types.js");
const constants_js_1 = require("../constants.js");
const zeroize_js_1 = require("../utils/zeroize.js");
class CanonicalJSON {
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
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.NON_CANONICAL_JSON, 'Failed to serialize to canonical JSON', { error: e });
        }
    }
    static async parse(canonicalString) {
        await this.assertCanonical(canonicalString);
        try {
            return JSON.parse(canonicalString);
        }
        catch (e) {
            throw new types_js_1.NewZoneCoreError(constants_js_1.ERROR_CODES.NON_CANONICAL_JSON, 'Invalid JSON', { error: e });
        }
    }
    static async assertCanonical(jsonString) {
        try {
            const obj = JSON.parse(jsonString);
            const recanonicalized = await this.serialize(obj);
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
        return (0, zeroize_js_1.constantTimeStringEqual)(aCanonical, bCanonical);
    }
    static async hash(obj) {
        const canonical = await this.serialize(obj);
        return new TextEncoder().encode(canonical);
    }
    static pretty(obj) {
        return JSON.stringify(obj, null, 2);
    }
}
exports.CanonicalJSON = CanonicalJSON;
//# sourceMappingURL=canonical.js.map