"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NotFoundError extends Error {
    constructor(args) {
        super(args);
        this.code = 404;
    }
}
exports.default = NotFoundError;
