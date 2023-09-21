"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const videoChecker_1 = __importDefault(require("./videoChecker"));
const convertDriveToMongo = (driveObj, ownerID, pageToken) => {
    let convertedObj = {};
    convertedObj._id = driveObj.id;
    convertedObj.filename = driveObj.name;
    convertedObj.length = driveObj.size;
    convertedObj.uploadDate = driveObj.modifiedTime;
    convertedObj.pageToken = pageToken;
    convertedObj.metadata = {
        IV: "",
        hasThumbnail: driveObj.hasThumbnail,
        isVideo: videoChecker_1.default(driveObj.name),
        owner: ownerID,
        parent: driveObj.parents[driveObj.parents.length - 1] === "root" ? "/" : driveObj.parents[driveObj.parents.length - 1],
        parentList: driveObj.parents,
        size: driveObj.size,
        drive: true,
        googleDoc: driveObj.mimeType === "application/vnd.google-apps.document",
        thumbnailID: driveObj.thumbnailLink,
        link: driveObj.shared ? driveObj.webViewLink : undefined,
        linkType: driveObj.shared ? "public" : undefined
    };
    return convertedObj;
};
exports.default = convertDriveToMongo;
