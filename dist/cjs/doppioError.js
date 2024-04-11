'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoppioError = void 0;
class DoppioError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DoppioError';
    }
}
exports.DoppioError = DoppioError;
