"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middleware/auth"));
const file_1 = __importDefault(require("../controllers/file"));
const env_1 = __importDefault(require("../enviroment/env"));
const MongoService_1 = __importDefault(require("../services/ChunkService/MongoService"));
const FileSystemService_1 = __importDefault(require("../services/ChunkService/FileSystemService"));
const S3Service_1 = __importDefault(require("../services/ChunkService/S3Service"));
const authFullUser_1 = __importDefault(require("../middleware/authFullUser"));
const authStreamVideo_1 = __importDefault(require("../middleware/authStreamVideo"));
let fileController;
let chunkService;
if (env_1.default.dbType === "mongo") {
    const mongoService = new MongoService_1.default();
    chunkService = mongoService;
    fileController = new file_1.default(mongoService);
}
else if (env_1.default.dbType === "fs") {
    const fileSystemService = new FileSystemService_1.default();
    chunkService = fileSystemService;
    fileController = new file_1.default(fileSystemService);
}
else {
    const s3Service = new S3Service_1.default();
    chunkService = s3Service;
    fileController = new file_1.default(s3Service);
}
const router = express_1.Router();
router.post("/file-service/upload", authFullUser_1.default, fileController.uploadFile);
router.get("/file-service/thumbnail/:id", authFullUser_1.default, fileController.getThumbnail);
router.get("/file-service/full-thumbnail/:id", authFullUser_1.default, fileController.getFullThumbnail);
router.get("/file-service/public/download/:id/:tempToken", fileController.getPublicDownload);
router.get("/file-service/public/info/:id/:tempToken", fileController.getPublicInfo);
router.get("/file-service/info/:id", auth_1.default, fileController.getFileInfo);
router.get("/file-service/quick-list", auth_1.default, fileController.getQuickList);
router.get("/file-service/list", auth_1.default, fileController.getList);
router.get("/file-service/download/access-token-stream-video", authFullUser_1.default, fileController.getAccessTokenStreamVideo);
router.get("/file-service/stream-video/:id", authStreamVideo_1.default, fileController.streamVideo);
router.delete("/file-service/remove-stream-video-token", authStreamVideo_1.default, fileController.removeStreamVideoAccessToken);
router.get("/file-service/download/:id", authFullUser_1.default, fileController.downloadFile);
router.get("/file-service/suggested-list", auth_1.default, fileController.getSuggestedList);
router.patch("/file-service/make-public/:id", authFullUser_1.default, fileController.makePublic);
router.patch("/file-service/make-one/:id", auth_1.default, fileController.makeOneTimePublic);
router.patch("/file-service/rename", auth_1.default, fileController.renameFile);
router.patch("/file-service/move", auth_1.default, fileController.moveFile);
router.delete("/file-service/remove-link/:id", auth_1.default, fileController.removeLink);
router.delete("/file-service/remove/token-video/:id", auth_1.default, fileController.removeTempToken);
router.delete("/file-service/remove", auth_1.default, fileController.deleteFile);
router.post("/file-service/send-share-email", auth_1.default, fileController.sendEmailShare);
exports.default = router;
// NO longer needed left for reference
//router.delete("/file-service/remove/token-video/:tempToken/:uuid", auth, fileController.removeTempToken);
//router.get("/file-service/stream-video/:id/:tempToken/:uuid", auth, fileController.streamVideo);
//router.get("/file-service/stream-video/:id", auth, fileController.streamVideo);
//router.get("/file-service/download/get-token", authFullUser, fileController.getDownloadToken);
//router.get("/file-service/download/get-token-video", auth, fileController.getDownloadTokenVideo);
