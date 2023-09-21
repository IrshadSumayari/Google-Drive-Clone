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
const googleapis_1 = require("googleapis");
const env_1 = __importDefault(require("../enviroment/env"));
const getGoogleAuth = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const googleIDandToken = yield (user === null || user === void 0 ? void 0 : user.decryptDriveIDandKey());
    const clientID = googleIDandToken === null || googleIDandToken === void 0 ? void 0 : googleIDandToken.clientID;
    const clientKey = googleIDandToken === null || googleIDandToken === void 0 ? void 0 : googleIDandToken.clientKey;
    const token = yield (user === null || user === void 0 ? void 0 : user.decryptDriveTokenData());
    const refreshToken = token.refresh_token;
    const date = new Date();
    const time = date.getTime();
    if (time >= token.expiry_date) {
        // console.log("TOKEN EXPIRED!")
    }
    const redirectURL = env_1.default.remoteURL + "/add-google-account";
    const oauth2Client = new googleapis_1.google.auth.OAuth2(clientID, clientKey, redirectURL);
    oauth2Client.setCredentials(token);
    return oauth2Client;
});
exports.default = getGoogleAuth;
