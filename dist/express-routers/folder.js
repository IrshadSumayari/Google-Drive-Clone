"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middleware/auth"));
const env_1 = __importDefault(require("../enviroment/env"));
const MongoService_1 = __importDefault(require("../services/ChunkService/MongoService"));
const FileSystemService_1 = __importDefault(require("../services/ChunkService/FileSystemService"));
const S3Service_1 = __importDefault(require("../services/ChunkService/S3Service"));
const folder_1 = __importDefault(require("../controllers/folder"));
let folderController;
if (env_1.default.dbType === "mongo") {
    const mongoService = new MongoService_1.default();
    folderController = new folder_1.default(mongoService);
}
else if (env_1.default.dbType === "fs") {
    const fileSystemService = new FileSystemService_1.default();
    folderController = new folder_1.default(fileSystemService);
}
else {
    const s3Service = new S3Service_1.default();
    folderController = new folder_1.default(s3Service);
}
const router = express_1.Router();
router.post("/folder-service/upload", auth_1.default, folderController.uploadFolder);
router.delete("/folder-service/remove", auth_1.default, folderController.deleteFolder);
router.delete("/folder-service/remove-all", auth_1.default, folderController.deleteAll);
router.get("/folder-service/info/:id", auth_1.default, folderController.getInfo);
router.get("/folder-service/subfolder-list", auth_1.default, folderController.getSubfolderList);
router.get("/folder-service/list", auth_1.default, folderController.getFolderList);
router.patch("/folder-service/rename", auth_1.default, folderController.renameFolder);
router.patch("/folder-service/move", auth_1.default, folderController.moveFolder);
router.get("/folder-service/subfolder-list-full", auth_1.default, folderController.getSubfolderFullList);
// Personal Folder
router.delete("/folder-service-personal/remove", auth_1.default, folderController.deletePersonalFolder);
exports.default = router;
