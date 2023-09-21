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
const file_1 = __importDefault(require("../../models/file"));
const folder_1 = __importDefault(require("../../models/folder"));
const thumbnail_1 = __importDefault(require("../../models/thumbnail"));
const mongodb_1 = require("mongodb");
;
const calculateS3Size_1 = __importDefault(require("../ChunkService/utils/calculateS3Size"));
class UserPeronsalService {
    constructor() {
        this.addS3Storage = (user, s3Data, uuid) => __awaiter(this, void 0, void 0, function* () {
            const { id, key, bucket } = s3Data;
            user.storageDataPersonal.storageSize = yield calculateS3Size_1.default(id, key, bucket);
            user.personalStorageCanceledDate = undefined;
            yield user.encryptS3Data(id, key, bucket);
            yield user.save();
            return yield user.generateAuthToken(uuid);
        });
        this.removeS3Storage = (user, uuid) => __awaiter(this, void 0, void 0, function* () {
            const date = new Date();
            user.s3Enabled = undefined;
            user.s3Data = undefined;
            user.storageDataPersonal = undefined;
            user.personalStorageCanceledDate = date.getTime();
            yield user.save();
            return yield user.generateAuthToken(uuid);
        });
        this.downloadPersonalFileList = (user) => __awaiter(this, void 0, void 0, function* () {
            const fileList = yield file_1.default.find({ "metadata.owner": new mongodb_1.ObjectID(user._id), "metadata.personalFile": true });
            const folderList = yield folder_1.default.find({ "owner": user._id.toString(), 'personalFolder': true });
            const thumbnailList = [];
            for (const currentFile of fileList) {
                if (currentFile.metadata.hasThumbnail) {
                    const currentThumbnail = yield thumbnail_1.default.findById(new mongodb_1.ObjectID(currentFile.metadata.thumbnailID));
                    thumbnailList.push(currentThumbnail);
                }
            }
            const combined = { fileList, folderList, thumbnailList };
            const data = JSON.stringify(combined);
            return data;
        });
        this.uploadPersonalFileList = (user, data) => __awaiter(this, void 0, void 0, function* () {
            const personalFileList = data.fileList;
            const personalFolderList = data.folderList;
            const personalThumbnailList = data.thumbnailList;
            const fixedFileList = [];
            for (let currentObj of personalFileList) {
                yield file_1.default.deleteMany({ _id: new mongodb_1.ObjectID(currentObj._id), 'metadata.owner': new mongodb_1.ObjectID(user._id) });
                currentObj.metadata.owner = new mongodb_1.ObjectID(user._id);
                currentObj._id = new mongodb_1.ObjectID(currentObj._id);
                const oldIV = currentObj.metadata.IV;
                const IV = Buffer.from(oldIV, 'base64');
                currentObj.metadata.IV = IV;
                const newDate = new Date(currentObj.uploadDate);
                currentObj.uploadDate = newDate;
                currentObj.metadata.parent = currentObj.metadata.parent.toString();
                fixedFileList.push(currentObj);
            }
            const fixedFolderList = [];
            for (let currentObj of personalFolderList) {
                yield folder_1.default.deleteMany({ _id: new mongodb_1.ObjectID(currentObj._id), owner: user._id.toString() });
                currentObj._id = new mongodb_1.ObjectID(currentObj._id);
                currentObj.owner = user._id.toString();
                currentObj.createdAt = new Date(currentObj.createdAt);
                currentObj.updatedAt = new Date(currentObj.updatedAt);
                fixedFolderList.push(currentObj);
            }
            const fixedThumbnailList = [];
            for (let currentObj of personalThumbnailList) {
                yield thumbnail_1.default.deleteMany({ _id: new mongodb_1.ObjectID(currentObj._id), owner: user._id.toString() });
                currentObj._id = new mongodb_1.ObjectID(currentObj._id);
                currentObj.owner = user._id.toString();
                currentObj.createdAt = new Date(currentObj.createdAt);
                currentObj.updatedAt = new Date(currentObj.updatedAt);
                const oldIV = currentObj.IV;
                const IV = Buffer.from(oldIV, 'base64');
                currentObj.IV = IV;
                fixedThumbnailList.push(currentObj);
            }
            yield file_1.default.insertMany(fixedFileList);
            yield folder_1.default.insertMany(fixedFolderList);
            yield thumbnail_1.default.insertMany(fixedThumbnailList);
        });
        this.removeS3Metadata = (user) => __awaiter(this, void 0, void 0, function* () {
            const fileList = yield file_1.default.find({ "metadata.owner": new mongodb_1.ObjectID(user._id),
                "metadata.personalFile": true });
            for (let currentFile of fileList) {
                yield file_1.default.deleteOne({ _id: new mongodb_1.ObjectID(currentFile._id) });
                yield file_1.default.deleteOne({ _id: currentFile._id });
                if (currentFile.metadata.hasThumbnail) {
                    yield thumbnail_1.default.deleteOne({ _id: new mongodb_1.ObjectID(currentFile.metadata.thumbnailID) });
                    yield thumbnail_1.default.deleteOne({ _id: currentFile.metadata.thumbnailID });
                }
            }
            yield folder_1.default.deleteMany({ 'owner': user._id.toString(), 'personalFolder': true });
        });
    }
}
exports.default = UserPeronsalService;
