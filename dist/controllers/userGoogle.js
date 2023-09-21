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
const UserGoogle_1 = __importDefault(require("../services/UserGoogle"));
const createCookies_1 = require("../cookies/createCookies");
const UserProviderGoogle = new UserGoogle_1.default();
class UserGoogleController {
    constructor() {
        this.createGoogleStorageURL = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const googleData = req.body;
                const url = yield UserProviderGoogle.createGoogleStorageURL(user, googleData);
                res.send(url);
            }
            catch (e) {
                console.log("\nCreate Storage URL Error Google User Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.addGoogleStorage = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const code = req.body.code;
                const currentUUID = req.headers.uuid;
                const { accessToken, refreshToken } = yield UserProviderGoogle.addGoogleStorage(user, code, currentUUID);
                createCookies_1.createLoginCookie(res, accessToken, refreshToken);
                res.send();
            }
            catch (e) {
                console.log("\nAdd Google Storage Error Google User Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.removeGoogleStorage = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const currentUUID = req.headers.uuid;
                const { accessToken, refreshToken } = yield UserProviderGoogle.removeGoogleStorage(user, currentUUID);
                createCookies_1.createLoginCookie(res, accessToken, refreshToken);
                res.send();
            }
            catch (e) {
                console.log("\nRemove Google Storage Error Google User Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
    }
}
exports.default = UserGoogleController;
