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
const UserService_1 = __importDefault(require("../services/UserService"));
const createCookies_1 = require("../cookies/createCookies");
const NotFoundError_1 = __importDefault(require("../utils/NotFoundError"));
const InternalServerError_1 = __importDefault(require("../utils/InternalServerError"));
const UserProvider = new UserService_1.default();
class UserController {
    constructor() {
        this.getUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                res.send(user);
            }
            catch (e) {
                console.log("\nGet User Route Error:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const currentUUID = req.headers.uuid;
                const { user, accessToken, refreshToken } = yield UserProvider.login(body, currentUUID);
                createCookies_1.createLoginCookie(res, accessToken, refreshToken);
                res.status(200).send({ user });
            }
            catch (e) {
                console.log("\nLogin User Route Error:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getToken = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                if (!user)
                    throw new NotFoundError_1.default("User Not Found");
                const currentUUID = req.headers.uuid;
                const { accessToken, refreshToken } = yield user.generateAuthToken(currentUUID);
                if (!accessToken || !refreshToken)
                    throw new InternalServerError_1.default("User/Access/Refresh Token Missing");
                createCookies_1.createLoginCookie(res, accessToken, refreshToken);
                res.status(201).send();
            }
            catch (e) {
                console.log("\nGet Refresh Token User Route Error:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.logout = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                const refreshToken = req.cookies["refresh-token"];
                yield UserProvider.logout(userID, refreshToken);
                createCookies_1.createLogoutCookie(res);
                res.send();
            }
            catch (e) {
                console.log("\nLogout User Route Error:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                createCookies_1.createLogoutCookie(res);
                res.status(code).send();
            }
        });
        this.logoutAll = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user)
                return;
            try {
                const userID = req.user._id;
                yield UserProvider.logoutAll(userID);
                createCookies_1.createLogoutCookie(res);
                res.send();
            }
            catch (e) {
                console.log("\nLogout All User Route Error:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.createUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (env_1.default.createAcctBlocked) {
                return yield res.status(401).send();
            }
            try {
                const currentUUID = req.headers.uuid;
                const { user, accessToken, refreshToken } = yield UserProvider.create(req.body, currentUUID);
                createCookies_1.createLoginCookie(res, accessToken, refreshToken);
                res.status(201).send({ user });
            }
            catch (e) {
                console.log("\nCreate User Route Error:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.changePassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                const oldPassword = req.body.oldPassword;
                const newPassword = req.body.newPassword;
                const oldRefreshToken = req.cookies["refresh-token"];
                const currentUUID = req.headers.uuid;
                const { accessToken, refreshToken } = yield UserProvider.changePassword(userID, oldPassword, newPassword, oldRefreshToken, currentUUID);
                createCookies_1.createLoginCookie(res, accessToken, refreshToken);
                res.send();
            }
            catch (e) {
                console.log("\nChange Password User Route Error:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.refreshStorageSize = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                yield UserProvider.refreshStorageSize(userID);
                res.send();
            }
            catch (e) {
                console.log("\nRefresh Storage Size User Route Error:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getUserDetailed = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                const userDetailed = yield UserProvider.getUserDetailed(userID);
                res.send(userDetailed);
            }
            catch (e) {
                console.log("\nGet User Detailed User Route Error:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.verifyEmail = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const verifyToken = req.body.emailToken;
                const currentUUID = req.headers.uuid;
                const user = yield UserProvider.verifyEmail(verifyToken);
                const { accessToken, refreshToken } = yield user.generateAuthToken(currentUUID);
                createCookies_1.createLoginCookie(res, accessToken, refreshToken);
                res.send();
            }
            catch (e) {
                console.log("\nVerify Email User Route Error:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.resendVerifyEmail = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                yield UserProvider.resendVerifyEmail(userID);
                res.send();
            }
            catch (e) {
                console.log("\nResend Email User Route Error:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.sendPasswordReset = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const email = req.body.email;
                yield UserProvider.sendPasswordReset(email);
                res.send();
            }
            catch (e) {
                console.log("\nSend Password Reset Email User Route Error:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.resetPassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const verifyToken = req.body.passwordToken;
                const newPassword = req.body.password;
                yield UserProvider.resetPassword(newPassword, verifyToken);
                res.send();
            }
            catch (e) {
                console.log("\nReset Password User Route Error:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.addName = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                const name = req.body.name;
                yield UserProvider.addName(userID, name);
                res.send();
            }
            catch (e) {
                console.log("\nAdd Name User Route Error:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
    }
}
exports.default = UserController;
