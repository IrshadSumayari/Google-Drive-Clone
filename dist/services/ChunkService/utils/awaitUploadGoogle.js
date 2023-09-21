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
const request_1 = __importDefault(require("request"));
const axios_1 = __importDefault(require("axios"));
const convertDriveToMongo_1 = __importDefault(require("../../../utils/convertDriveToMongo"));
const awaitUploadGoogle = (file, size, axiosBody, axiosConfigObj, drive, req, res, allStreamsToErrorCatch) => {
    return new Promise((resolve, reject) => {
        allStreamsToErrorCatch.forEach((currentStream) => {
            currentStream.on("error", (err) => {
                console.log("req errror", err);
                reject({
                    message: "Await Stream Input Error",
                    code: 500,
                    error: err
                });
            });
        });
        axios_1.default.post("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable", axiosBody, axiosConfigObj).then((result) => {
            const URI = result.headers.location;
            request_1.default.post({
                url: URI,
                headers: {
                    "Content-Length": size,
                },
                body: file
            }, function (e, results, b) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (e) {
                        console.log(e);
                        return;
                    }
                    const jsonResults = JSON.parse(results.body);
                    const retrievedFile = yield drive.files.get({
                        fileId: jsonResults.id,
                        fields: "*"
                    });
                    const reqAny = req;
                    const uploadedFile = convertDriveToMongo_1.default(retrievedFile.data, reqAny.user._id);
                    res.send(uploadedFile);
                    resolve();
                });
            });
        }).catch((err) => {
            console.log("axios err", err);
        });
    });
};
exports.default = awaitUploadGoogle;
