"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const diskusage_1 = __importDefault(require("diskusage"));
const env_1 = __importDefault(require("../enviroment/env"));
class StorageController {
    constructor() {
        this.getStorageInfo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                if (!env_1.default.root || env_1.default.root.length === 0) {
                    return;
                }
                const info = yield diskusage_1.default.check(env_1.default.root);
                res.send(info);
            }
            catch (e) {
                console.log("\nGet Storage Error Storage Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
    }
}
exports.default = StorageController;
