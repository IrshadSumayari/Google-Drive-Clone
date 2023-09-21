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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const env_1 = __importDefault(require("../enviroment/env"));
const mongodb_1 = require("mongodb");
const removeOldTokens = (userID, uuid, oldTime) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const minusTime = oldTime - (1000 * 60 * 60);
        //const minusTime = oldTime - (1000);
        uuid = uuid ? uuid : "unknown";
        if (uuid === "unknown")
            return;
        yield user_1.default.updateOne({ _id: userID }, { $pull: { tokens: { uuid, time: { $lt: minusTime } } } });
    }
    catch (e) {
        console.log("cannot remove old tokens", e);
    }
});
const authRefresh = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refreshToken = req.cookies["refresh-token"];
        const currentUUID = req.headers.uuid;
        if (!refreshToken)
            throw new Error("No Refresh Token");
        const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.default.passwordRefresh);
        const time = decoded.time;
        const user = yield user_1.default.findById(new mongodb_1.ObjectID(decoded._id));
        if (!user)
            throw new Error("No User");
        const encrpytionKey = user.getEncryptionKey();
        const encryptedToken = user.encryptToken(refreshToken, encrpytionKey, decoded.iv);
        let tokenFound = false;
        for (let i = 0; i < user.tokens.length; i++) {
            const currentEncryptedToken = user.tokens[i].token;
            if (currentEncryptedToken === encryptedToken) {
                tokenFound = true;
                removeOldTokens(user._id, currentUUID, time);
                break;
            }
        }
        if (!tokenFound) {
            console.log("token not found", encryptedToken);
            console.log("token list", user.tokens);
        }
        if (!tokenFound)
            throw new Error("Refresh Token Not Found");
        req.user = user;
        next();
    }
    catch (e) {
        if (e.message !== "No Refresh Token" &&
            e.message !== "No User" &&
            e.message !== "Refresh Token Not Found")
            console.log("\nAuthorization Refresh Middleware Error:", e.message);
        res.status(401).send("Error Refreshing Token");
    }
});
exports.default = authRefresh;
