"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NotEmailVerifiedError extends Error {
    constructor(args) {
        super(args);
        this.code = 404;
    }
}
exports.default = NotEmailVerifiedError;
