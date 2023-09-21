"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const convertDriveToMongo_1 = __importDefault(require("./convertDriveToMongo"));
const convertDriveListToMongoList = (driveObjs, ownerID, pageToken) => {
    let convertedObjs = [];
    for (let currentObj of driveObjs) {
        convertedObjs.push(convertDriveToMongo_1.default(currentObj, ownerID, pageToken));
    }
    return convertedObjs;
};
exports.default = convertDriveListToMongoList;
