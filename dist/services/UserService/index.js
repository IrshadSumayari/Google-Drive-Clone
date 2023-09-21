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
const user_1 = __importDefault(require("../../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const NotFoundError_1 = __importDefault(require("../../utils/NotFoundError"));
const InternalServerError_1 = __importDefault(require("../../utils/InternalServerError"));
const sendVerificationEmail_1 = __importDefault(require("../../utils/sendVerificationEmail"));
const file_1 = __importDefault(require("../../models/file"));
const env_1 = __importDefault(require("../../enviroment/env"));
const googleAuth_1 = __importDefault(require("../../db/googleAuth"));
const googleapis_1 = require("googleapis");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendVerificationEmail_2 = __importDefault(require("../../utils/sendVerificationEmail"));
const sendPasswordResetEmail_1 = __importDefault(require("../../utils/sendPasswordResetEmail"));
const ForbiddenError_1 = __importDefault(require("../../utils/ForbiddenError"));
const uknownUserType = user_1.default;
const UserStaticType = uknownUserType;
class UserService {
    constructor() {
        this.login = (userData, uuid) => __awaiter(this, void 0, void 0, function* () {
            const email = userData.email;
            const password = userData.password;
            const user = yield UserStaticType.findByCreds(email, password);
            if (!user)
                throw new NotFoundError_1.default("Cannot Find User");
            const { accessToken, refreshToken } = yield user.generateAuthToken(uuid);
            if (!accessToken || !refreshToken)
                throw new NotFoundError_1.default("Login User Not Found Error");
            return { user, accessToken, refreshToken };
        });
        this.logout = (userID, refreshToken) => __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.default.findById(userID);
            if (!user)
                throw new NotFoundError_1.default("Could Not Find User");
            if (refreshToken) {
                const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.default.passwordRefresh);
                const encrpytionKey = user.getEncryptionKey();
                const encryptedToken = user.encryptToken(refreshToken, encrpytionKey, decoded.iv);
                for (let i = 0; i < user.tokens.length; i++) {
                    const currentEncryptedToken = user.tokens[i].token;
                    if (currentEncryptedToken === encryptedToken) {
                        user.tokens.splice(i, 1);
                        yield user.save();
                        break;
                    }
                }
            }
            yield user.save();
        });
        this.logoutAll = (userID) => __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.default.findById(userID);
            if (!user)
                throw new NotFoundError_1.default("Could Not Find User");
            user.tokens = [];
            user.tempTokens = [];
            yield user.save();
        });
        this.create = (userData, uuid) => __awaiter(this, void 0, void 0, function* () {
            const user = new user_1.default({ email: userData.email, password: userData.password, emailVerified: env_1.default.disableEmailVerification });
            yield user.save();
            if (!user)
                throw new NotFoundError_1.default("User Not Found");
            yield user.generateEncryptionKeys();
            const { accessToken, refreshToken } = yield user.generateAuthToken(uuid);
            const emailToken = yield user.generateEmailVerifyToken();
            if (!env_1.default.disableEmailVerification)
                yield sendVerificationEmail_1.default(user, emailToken);
            if (!accessToken || !refreshToken)
                throw new InternalServerError_1.default("Could Not Create New User Error");
            return { user, accessToken, refreshToken };
        });
        this.changePassword = (userID, oldPassword, newPassword, oldRefreshToken, uuid) => __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.default.findById(userID);
            if (!user)
                throw new NotFoundError_1.default("Could Not Find User");
            const date = new Date();
            const isMatch = yield bcrypt_1.default.compare(oldPassword, user.password);
            if (!isMatch)
                throw new ForbiddenError_1.default("Change Passwords Do Not Match Error");
            const encryptionKey = user.getEncryptionKey();
            user.password = newPassword;
            user.tokens = [];
            user.tempTokens = [];
            user.passwordLastModified = date.getTime();
            yield user.save();
            yield user.changeEncryptionKey(encryptionKey);
            const { accessToken, refreshToken } = yield user.generateAuthToken(uuid);
            return { accessToken, refreshToken };
        });
        this.refreshStorageSize = (userID) => __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.default.findById(userID);
            if (!user)
                throw new NotFoundError_1.default("Cannot find user");
            const fileList = yield file_1.default.find({ "metadata.owner": user._id, "metadata.personalFile": null });
            let size = 0;
            for (let currentFile of fileList) {
                size += currentFile.length;
            }
            user.storageData = { storageSize: size, storageLimit: 0 };
            yield user.save();
        });
        this.getUserDetailed = (userID) => __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.default.findById(userID);
            if (!user)
                throw new NotFoundError_1.default("Cannot find user");
            if (user.s3Enabled) {
                try {
                    const { bucket } = yield user.decryptS3Data();
                    user.s3Data.bucket = bucket;
                }
                catch (e) {
                    console.log("getting s3 storage data error");
                    user.storageDataPersonal = { storageSize: 0, failed: true };
                }
            }
            if (user.googleDriveEnabled) {
                try {
                    const { clientID } = yield user.decryptDriveIDandKey();
                    const oauth2Client = yield googleAuth_1.default(user);
                    const drive = googleapis_1.google.drive({ version: "v3", auth: oauth2Client });
                    const googleData = yield drive.about.get({
                        fields: "storageQuota"
                    });
                    user.storageDataGoogle = { storageLimit: +googleData.data.storageQuota.limit, storageSize: +googleData.data.storageQuota.usage };
                    user.googleDriveData.id = clientID;
                }
                catch (e) {
                    user.storageDataGoogle = { storageLimit: 0, storageSize: 0, failed: true };
                    console.log("get google drive storage data error", e.message);
                }
            }
            if (!user.storageData || (!user.storageData.storageSize && !user.storageData.storageLimit))
                user.storageData = { storageLimit: 0, storageSize: 0 };
            if (!user.storageDataPersonal || (!user.storageDataPersonal.storageSize && !user.storageDataPersonal.failed))
                user.storageDataPersonal = { storageSize: 0 };
            if (!user.storageDataGoogle || (!user.storageDataGoogle.storageLimit && !user.storageDataGoogle.storageSize && !user.storageDataGoogle.failed))
                user.storageDataGoogle = { storageLimit: 0, storageSize: 0 };
            return user;
        });
        this.verifyEmail = (verifyToken) => __awaiter(this, void 0, void 0, function* () {
            const decoded = jsonwebtoken_1.default.verify(verifyToken, env_1.default.passwordAccess);
            const iv = decoded.iv;
            const user = yield user_1.default.findOne({ _id: decoded._id });
            const encrpytionKey = user.getEncryptionKey();
            const encryptedToken = user.encryptToken(verifyToken, encrpytionKey, iv);
            if (encryptedToken === user.emailToken) {
                user.emailVerified = true;
                yield user.save();
                return user;
            }
            else {
                throw new ForbiddenError_1.default('Email Token Verification Failed');
            }
        });
        this.resendVerifyEmail = (userID) => __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.default.findById(userID);
            if (!user)
                throw new NotFoundError_1.default("Cannot find user");
            const verifiedEmail = user.emailVerified;
            if (!verifiedEmail) {
                const emailToken = yield user.generateEmailVerifyToken();
                yield sendVerificationEmail_2.default(user, emailToken);
            }
            else {
                throw new ForbiddenError_1.default("Email Already Authorized");
            }
        });
        this.sendPasswordReset = (email) => __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.default.findOne({ email });
            if (!user)
                throw new NotFoundError_1.default("User Not Found Password Reset Email");
            const passwordResetToken = yield user.generatePasswordResetToken();
            yield sendPasswordResetEmail_1.default(user, passwordResetToken);
        });
        this.resetPassword = (newPassword, verifyToken) => __awaiter(this, void 0, void 0, function* () {
            const decoded = jsonwebtoken_1.default.verify(verifyToken, env_1.default.passwordAccess);
            const iv = decoded.iv;
            const user = yield user_1.default.findOne({ _id: decoded._id });
            const encrpytionKey = user.getEncryptionKey();
            const encryptedToken = user.encryptToken(verifyToken, encrpytionKey, iv);
            if (encryptedToken === user.passwordResetToken) {
                const encryptionKey = user.getEncryptionKey();
                user.password = newPassword;
                user.tokens = [];
                user.tempTokens = [];
                user.passwordResetToken = undefined;
                yield user.save();
                yield user.changeEncryptionKey(encryptionKey);
            }
            else {
                throw new ForbiddenError_1.default("Reset Password Token Do Not Match");
            }
        });
        this.addName = (userID, name) => __awaiter(this, void 0, void 0, function* () {
            if (!name || name.length === 0)
                throw new ForbiddenError_1.default("No name");
            const user = yield user_1.default.findById(userID);
            if (!user)
                throw new NotFoundError_1.default("Cannot find user");
            user.name = name;
            yield user.save();
        });
    }
}
exports.default = UserService;
