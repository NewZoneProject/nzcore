/**
 * NewZoneCore - Core Type Definitions
 */
// ============ Error Types ============
export class NewZoneCoreError extends Error {
    constructor(code, message, context) {
        super(message);
        this.name = 'NewZoneCoreError';
        this.code = code;
        this.context = context;
        Object.setPrototypeOf(this, NewZoneCoreError.prototype);
    }
}
