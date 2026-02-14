"use strict";
/**
 * NewZoneCore - Core Type Definitions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewZoneCoreError = void 0;
// ============ Error Types ============
class NewZoneCoreError extends Error {
    constructor(code, message, context) {
        super(message);
        this.name = 'NewZoneCoreError';
        this.code = code;
        this.context = context;
        Object.setPrototypeOf(this, NewZoneCoreError.prototype);
    }
}
exports.NewZoneCoreError = NewZoneCoreError;
//# sourceMappingURL=types.js.map