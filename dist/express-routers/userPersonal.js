"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middleware/auth"));
const userPersonal_1 = __importDefault(require("../controllers/userPersonal"));
const authFullUser_1 = __importDefault(require("../middleware/authFullUser"));
const userPersonalController = new userPersonal_1.default();
const router = express_1.Router();
router.get("/user-service/download-personal-file-list", auth_1.default, userPersonalController.downloadPersonalFileList);
router.post("/user-service/upload-personal-file-list", auth_1.default, userPersonalController.uploadPersonalFileList);
router.post("/user-service/add-s3-storage", authFullUser_1.default, userPersonalController.addS3Storage);
router.delete("/user-service/remove-s3-storage", authFullUser_1.default, userPersonalController.removeS3Storage);
router.delete("/user-service/remove-s3-metadata", auth_1.default, userPersonalController.removeS3Metadata);
exports.default = router;
