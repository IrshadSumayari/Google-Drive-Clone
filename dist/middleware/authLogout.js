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
const env_1 = __importDefault(require("../enviroment/env"));
const createCookies_1 = require("../cookies/createCookies");
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = req.cookies["access-token"];
        if (!accessToken)
            throw new Error("No Access Token");
        const decoded = jsonwebtoken_1.default.verify(accessToken, env_1.default.passwordAccess);
        const user = decoded.user;
        if (!user)
            throw new Error("No User");
        req.user = user;
        next();
    }
    catch (e) {
        if (e.message !== "No Access Token" &&
            e.message !== "No User")
            console.log("\nAuthorization Logout Middleware Error:", e.message);
        createCookies_1.createLogoutCookie(res);
        return res.status(401).send("Error Authenticating");
    }
});
exports.default = auth;
