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
const env_1 = __importDefault(require("../enviroment/env"));
const crypto_1 = __importDefault(require("crypto"));
const getWebUIKey_1 = __importDefault(require("./getWebUIKey"));
const getKey = () => __awaiter(void 0, void 0, void 0, function* () {
    if (process.env.KEY) {
        // For Docker 
        const password = process.env.KEY;
        env_1.default.key = crypto_1.default.createHash("md5").update(password).digest("hex");
    }
    else if (process.env.NODE_ENV === "production") {
        let password = yield getWebUIKey_1.default();
        password = crypto_1.default.createHash("md5").update(password).digest("hex");
        env_1.default.key = password;
    }
    else {
        let password = "1234";
        password = crypto_1.default.createHash("md5").update(password).digest("hex");
        env_1.default.key = password;
    }
});
exports.default = getKey;
