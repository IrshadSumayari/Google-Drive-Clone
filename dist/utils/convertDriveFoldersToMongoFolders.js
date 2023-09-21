"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const convertDriveFolderToMongoFolder_1 = __importDefault(require("./convertDriveFolderToMongoFolder"));
const convertDriveFoldersToMongoFolders = (driveObjs, ownerID) => {
    let convertedFolders = [];
    for (let currentFolder of driveObjs) {
        convertedFolders.push(convertDriveFolderToMongoFolder_1.default(currentFolder, ownerID));
    }
    return convertedFolders;
};
exports.default = convertDriveFoldersToMongoFolders;
