"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const googleFolder_1 = __importDefault(require("../controllers/googleFolder"));
const authFullUser_1 = __importDefault(require("../middleware/authFullUser"));
const googleFolderController = new googleFolder_1.default();
const router = express_1.Router();
router.get("/folder-service-google/list", authFullUser_1.default, googleFolderController.getList);
router.get("/folder-service-google-mongo/list", authFullUser_1.default, googleFolderController.getGoogleMongoList);
router.get("/folder-service-google/info/:id", authFullUser_1.default, googleFolderController.getInfo);
router.get("/folder-service-google/subfolder-list", authFullUser_1.default, googleFolderController.getSubFolderList);
router.get("/folder-service-google/subfolder-list-full", authFullUser_1.default, googleFolderController.getSubfolderFullList);
router.patch("/folder-service-google/rename", authFullUser_1.default, googleFolderController.renameFolder);
router.delete("/folder-service-google/remove", authFullUser_1.default, googleFolderController.removeFolder);
router.post("/folder-service-google/upload", authFullUser_1.default, googleFolderController.upload);
router.patch("/folder-service-google/move", authFullUser_1.default, googleFolderController.moveFolder);
exports.default = router;
