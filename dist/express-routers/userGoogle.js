"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userGoogle_1 = __importDefault(require("../controllers/userGoogle"));
const authFullUser_1 = __importDefault(require("../middleware/authFullUser"));
const userGoogleController = new userGoogle_1.default();
const router = express_1.Router();
router.post("/user-service/create-google-storage-url", authFullUser_1.default, userGoogleController.createGoogleStorageURL);
router.post("/user-service/add-google-storage", authFullUser_1.default, userGoogleController.addGoogleStorage);
router.delete("/user-service/remove-google-storage", authFullUser_1.default, userGoogleController.removeGoogleStorage);
exports.default = router;
