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
const env_1 = __importDefault(require("../../enviroment/env"));
const googleapis_1 = require("googleapis");
class UserGoogleService {
    constructor() {
        this.createGoogleStorageURL = (user, googleData) => __awaiter(this, void 0, void 0, function* () {
            const { clientID, clientKey, clientRedirect } = googleData;
            const oauth2Client = new googleapis_1.google.auth.OAuth2(clientID, clientKey, env_1.default.remoteURL + "/add-google-account");
            const url = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                prompt: "consent",
                scope: ["https://www.googleapis.com/auth/drive"],
            });
            yield user.encryptDriveIDandKey(clientID, clientKey);
            user.decryptDriveIDandKey();
            return url;
        });
        this.addGoogleStorage = (user, code, uuid) => __awaiter(this, void 0, void 0, function* () {
            const redirectURL = env_1.default.remoteURL + "/add-google-account";
            const decrypyedIdandKey = yield user.decryptDriveIDandKey();
            const clientID = decrypyedIdandKey.clientID;
            const clientKey = decrypyedIdandKey.clientKey;
            const oauth2Client = new googleapis_1.google.auth.OAuth2(clientID, clientKey, redirectURL);
            return new Promise((resolve, reject) => {
                oauth2Client.getToken(code, (err, tokens) => __awaiter(this, void 0, void 0, function* () {
                    if (!err) {
                        const token = tokens;
                        user.encryptDriveTokenData(token);
                        const { accessToken, refreshToken } = yield user.generateAuthToken(uuid);
                        resolve({ accessToken, refreshToken });
                    }
                    else {
                        reject("Get Google Token Error");
                    }
                }));
            });
        });
        this.removeGoogleStorage = (user, uuid) => __awaiter(this, void 0, void 0, function* () {
            user.googleDriveEnabled = undefined;
            user.googleDriveData = undefined;
            yield user.save();
            return yield user.generateAuthToken(uuid);
        });
    }
}
exports.default = UserGoogleService;
