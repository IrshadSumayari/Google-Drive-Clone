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
const S3Service_1 = __importDefault(require("../services/ChunkService/S3Service"));
class PersonalFileController {
    constructor() {
        this.getPersonalThumbnail = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const s3Service = new S3Service_1.default();
                const user = req.user;
                const id = req.params.id;
                const decryptedThumbnail = yield s3Service.getThumbnail(user, id);
                res.send(decryptedThumbnail);
            }
            catch (e) {
                console.log("\nGet Thumbnail Error Personal File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getFullPersonalThumbnail = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const s3Service = new S3Service_1.default();
                const user = req.user;
                const fileID = req.params.id;
                yield s3Service.getFullThumbnail(user, fileID, res);
            }
            catch (e) {
                console.log("\nGet Full Thumbnail Error Personal File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.uploadPersonalFile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const s3Service = new S3Service_1.default();
                const user = req.user;
                const busboy = req.busboy;
                req.pipe(busboy);
                const file = yield s3Service.uploadFile(user, busboy, req);
                res.send(file);
            }
            catch (e) {
                console.log("\nUpload File Error Personal File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getPublicPersonalDownload = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const ID = req.params.id;
                const tempToken = req.params.tempToken;
                const s3Service = new S3Service_1.default();
                yield s3Service.getPublicDownload(ID, tempToken, res);
            }
            catch (e) {
                console.log("\nGet Public Download Error Personal File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.streamPersonalVideo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const fileID = req.params.id;
                const headers = req.headers;
                const s3Service = new S3Service_1.default();
                yield s3Service.streamVideo(user, fileID, headers, res, req);
            }
            catch (e) {
                console.log("\nStream Video Error Personal File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.downloadPersonalFile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const s3Service = new S3Service_1.default();
                const user = req.user;
                const fileID = req.params.id;
                yield s3Service.downloadFile(user, fileID, res);
            }
            catch (e) {
                console.log("\nDownload File Error Personal File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.deletePersonalFile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const s3Service = new S3Service_1.default();
                const userID = req.user._id;
                const fileID = req.body.id;
                yield s3Service.deleteFile(userID, fileID);
                res.send();
            }
            catch (e) {
                console.log("\nDelete File Error Personal File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
    }
}
exports.default = PersonalFileController;
