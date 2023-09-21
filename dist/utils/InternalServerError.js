"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InternalServerError extends Error {
    constructor(args) {
        super(args);
        this.code = 500;
    }
}
exports.default = InternalServerError;
