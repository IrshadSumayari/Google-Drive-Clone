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
const UserPersonalService_1 = __importDefault(require("../services/UserPersonalService"));
const createCookies_1 = require("../cookies/createCookies");
const UserProviderPersonal = new UserPersonalService_1.default();
class UserPersonalController {
    constructor() {
        this.addS3Storage = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const s3Data = req.body;
                const currentUUID = req.headers.uuid;
                const { accessToken, refreshToken } = yield UserProviderPersonal.addS3Storage(user, s3Data, currentUUID);
                createCookies_1.createLoginCookie(res, accessToken, refreshToken);
                res.send();
            }
            catch (e) {
                console.log("\nAdd S3 Storage Error Personal User Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.removeS3Storage = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const currentUUID = req.headers.uuid;
                const { accessToken, refreshToken } = yield UserProviderPersonal.removeS3Storage(user, currentUUID);
                createCookies_1.createLoginCookie(res, accessToken, refreshToken);
                res.send();
            }
            catch (e) {
                console.log("\nRemove S3 Storage Error Personal User Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.removeS3Metadata = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                yield UserProviderPersonal.removeS3Metadata(user);
                res.send();
            }
            catch (e) {
                console.log("\nRemove S3 Metadata Error Personal User Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.downloadPersonalFileList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                res.set('Content-Type', 'application/json');
                res.setHeader('Content-disposition', 'attachment; filename= personal-data-list.json');
                const personalFileList = yield UserProviderPersonal.downloadPersonalFileList(user);
                res.send(personalFileList);
            }
            catch (e) {
                console.log("\nDownload S3 Metadata Error Personal User Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.uploadPersonalFileList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const fileList = req.body;
                yield UserProviderPersonal.uploadPersonalFileList(user, fileList);
                res.send();
            }
            catch (e) {
                console.log("\nUpload S3 Metadata Error Personal User Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
    }
}
exports.default = UserPersonalController;
