"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storage_1 = __importDefault(require("../controllers/storage"));
const storageController = new storage_1.default();
const router = express_1.Router();
// No longer needed left for reference
// router.get("/storage-service/info", auth, storageController.getStorageInfo);
exports.default = router;
