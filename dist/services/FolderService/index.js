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
const folder_1 = __importDefault(require("../../models/folder"));
const InternalServerError_1 = __importDefault(require("../../utils/InternalServerError"));
const NotFoundError_1 = __importDefault(require("../../utils/NotFoundError"));
const fileUtils_1 = __importDefault(require("../../db/utils/fileUtils"));
const folderUtils_1 = __importDefault(require("../../db/utils/folderUtils"));
const sortBySwitchFolder_1 = __importDefault(require("../../utils/sortBySwitchFolder"));
const utilsFile = new fileUtils_1.default();
const utilsFolder = new folderUtils_1.default();
class FolderService {
    constructor() {
        this.uploadFolder = (data) => __awaiter(this, void 0, void 0, function* () {
            const folder = new folder_1.default(data);
            yield folder.save();
            if (!folder)
                throw new InternalServerError_1.default("Upload Folder Error");
            return folder;
        });
        this.getFolderInfo = (userID, folderID) => __awaiter(this, void 0, void 0, function* () {
            let currentFolder = yield utilsFolder.getFolderInfo(folderID, userID);
            if (!currentFolder)
                throw new NotFoundError_1.default("Folder Info Not Found Error");
            const parentID = currentFolder.parent;
            let parentName = "";
            if (parentID === "/") {
                parentName = "Home";
            }
            else {
                const parentFolder = yield utilsFolder.getFolderInfo(parentID, userID);
                if (parentFolder) {
                    parentName = parentFolder.name;
                }
                else {
                    parentName = "Unknown";
                }
            }
            const folderName = currentFolder.name;
            currentFolder = Object.assign(Object.assign({}, currentFolder._doc), { parentName, folderName });
            // Must Use ._doc here, or the destucturing/spreading 
            // Will add a bunch of unneeded variables to the object.
            return currentFolder;
        });
        this.getFolderSublist = (userID, folderID) => __awaiter(this, void 0, void 0, function* () {
            const folder = yield utilsFolder.getFolderInfo(folderID, userID);
            if (!folder)
                throw new NotFoundError_1.default("Folder Sublist Not Found Error");
            const subfolderList = folder.parentList;
            let folderIDList = [];
            let folderNameList = [];
            for (let i = 0; i < subfolderList.length; i++) {
                const currentSubFolderID = subfolderList[i];
                if (currentSubFolderID === "/") {
                    folderIDList.push("/");
                    folderNameList.push("Home");
                }
                else {
                    const currentFolder = yield utilsFolder.getFolderInfo(currentSubFolderID, userID);
                    folderIDList.push(currentFolder._id);
                    folderNameList.push(currentFolder.name);
                }
            }
            folderIDList.push(folderID);
            folderNameList.push(folder.name);
            return {
                folderIDList,
                folderNameList
            };
        });
        this.getFolderList = (user, query) => __awaiter(this, void 0, void 0, function* () {
            const userID = user._id;
            let searchQuery = query.search || "";
            const parent = query.parent || "/";
            let sortBy = query.sortby || "DEFAULT";
            const type = query.type;
            const storageType = query.storageType || undefined;
            const folderSearch = query.folder_search || undefined;
            const itemType = query.itemType || undefined;
            sortBy = sortBySwitchFolder_1.default(sortBy);
            const s3Enabled = user.s3Enabled ? true : false;
            if (searchQuery.length === 0) {
                const folderList = yield utilsFolder.getFolderListByParent(userID, parent, sortBy, s3Enabled, type, storageType, itemType);
                if (!folderList)
                    throw new NotFoundError_1.default("Folder List Not Found Error");
                return folderList;
            }
            else {
                searchQuery = new RegExp(searchQuery, 'i');
                const folderList = yield utilsFolder.getFolderListBySearch(userID, searchQuery, sortBy, type, parent, storageType, folderSearch, itemType, s3Enabled);
                if (!folderList)
                    throw new NotFoundError_1.default("Folder List Not Found Error");
                return folderList;
            }
        });
        this.renameFolder = (userID, folderID, title) => __awaiter(this, void 0, void 0, function* () {
            const folder = yield utilsFolder.renameFolder(folderID, userID, title);
            if (!folder)
                throw new NotFoundError_1.default("Rename Folder Not Found");
        });
        this.getSubfolderFullList = (user, id) => __awaiter(this, void 0, void 0, function* () {
            const userID = user._id;
            const folder = yield utilsFolder.getFolderInfo(id, userID);
            const subFolders = yield this.getFolderList(user, { parent: id }); //folderService.getFolderList(user._id, {parent: id})
            let folderList = [];
            const rootID = "/";
            let currentID = folder.parent;
            folderList.push({
                _id: folder._id,
                parent: folder._id,
                name: folder.name,
                subFolders: subFolders
            });
            while (true) {
                if (rootID === currentID)
                    break;
                const currentFolder = yield this.getFolderInfo(userID, currentID);
                const currentSubFolders = yield this.getFolderList(user, { parent: currentFolder._id });
                folderList.splice(0, 0, {
                    _id: currentFolder._id,
                    parent: currentFolder._id,
                    name: currentFolder.name,
                    subFolders: currentSubFolders
                });
                currentID = currentFolder.parent;
            }
            return folderList;
        });
        this.moveFolder = (userID, folderID, parentID) => __awaiter(this, void 0, void 0, function* () {
            let parentList = ["/"];
            if (parentID.length !== 1) {
                const parentFile = yield utilsFolder.getFolderInfo(parentID, userID);
                parentList = parentFile.parentList;
                parentList.push(parentID);
            }
            const folder = yield utilsFolder.moveFolder(folderID, userID, parentID, parentList);
            if (!folder)
                throw new NotFoundError_1.default("Move Folder Not Found");
            const folderChilden = yield utilsFolder.findAllFoldersByParent(folderID.toString(), userID);
            folderChilden.map((currentFolderChild) => __awaiter(this, void 0, void 0, function* () {
                let currentFolderChildParentList = currentFolderChild.parentList;
                const indexOfFolderID = currentFolderChildParentList.indexOf(folderID.toString());
                currentFolderChildParentList = currentFolderChildParentList.splice(indexOfFolderID);
                currentFolderChildParentList = [...parentList, ...currentFolderChildParentList];
                currentFolderChild.parentList = currentFolderChildParentList;
                yield currentFolderChild.save();
            }));
            const fileChildren = yield utilsFile.getFileListByParent(userID, folderID.toString());
            fileChildren.map((currentFileChild) => __awaiter(this, void 0, void 0, function* () {
                let currentFileChildParentList = currentFileChild.metadata.parentList;
                currentFileChildParentList = currentFileChildParentList.split(",");
                const indexOfFolderID = currentFileChildParentList.indexOf(folderID.toString());
                currentFileChildParentList = currentFileChildParentList.splice(indexOfFolderID);
                currentFileChildParentList = [...parentList, ...currentFileChildParentList];
                yield utilsFile.moveFile(currentFileChild._id, userID, currentFileChild.metadata.parent, currentFileChildParentList.toString());
            }));
        });
    }
}
exports.default = FolderService;
