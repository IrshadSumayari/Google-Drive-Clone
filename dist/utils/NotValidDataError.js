"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NotValidDataError extends Error {
    constructor(args) {
        super(args);
        this.code = 403;
    }
}
exports.default = NotValidDataError;
