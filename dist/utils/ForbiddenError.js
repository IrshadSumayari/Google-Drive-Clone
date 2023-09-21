"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ForbiddenError extends Error {
    constructor(args) {
        super(args);
        this.code = 403;
    }
}
exports.default = ForbiddenError;
