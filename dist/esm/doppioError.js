'use strict';
export class DoppioError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DoppioError';
    }
}
