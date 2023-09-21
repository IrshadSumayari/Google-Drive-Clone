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
const createThumbnailS3_1 = __importDefault(require("./createThumbnailS3"));
const createThumbnail_1 = __importDefault(require("./createThumbnail"));
const createThumbnailFS_1 = __importDefault(require("./createThumbnailFS"));
const env_1 = __importDefault(require("../../../enviroment/env"));
const createThumnailAny = (currentFile, filename, user) => __awaiter(void 0, void 0, void 0, function* () {
    if (currentFile.metadata.personalFile || env_1.default.dbType === "s3") {
        return yield createThumbnailS3_1.default(currentFile, filename, user);
    }
    else if (env_1.default.dbType === "mongo") {
        return yield createThumbnail_1.default(currentFile, filename, user);
    }
    else {
        return yield createThumbnailFS_1.default(currentFile, filename, user);
    }
});
exports.default = createThumnailAny;
