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
const user_1 = __importDefault(require("../models/user"));
const NotFoundError_1 = __importDefault(require("./NotFoundError"));
const createCookies_1 = require("../cookies/createCookies");
const userUpdateCheck = (res, id, uuid) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedUser = yield user_1.default.findById(id);
    if (!updatedUser)
        throw new NotFoundError_1.default("Cannot find updated user auth");
    if (updatedUser.emailVerified) {
        const { accessToken, refreshToken } = yield updatedUser.generateAuthToken(uuid);
        createCookies_1.createLoginCookie(res, accessToken, refreshToken);
    }
    let strippedUser = { _id: updatedUser._id, emailVerified: updatedUser.emailVerified, email: updatedUser.email, botChecked: false };
    return strippedUser;
});
exports.default = userUpdateCheck;
