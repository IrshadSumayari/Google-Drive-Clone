"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NotAuthorizedError extends Error {
    constructor(args) {
        super(args);
        this.code = 401;
    }
}
exports.default = NotAuthorizedError;
