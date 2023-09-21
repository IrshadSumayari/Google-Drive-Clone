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
const mongoose_1 = __importDefault(require("mongoose"));
const validator_1 = __importDefault(require("validator"));
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("../enviroment/env"));
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if (!validator_1.default.isEmail(value)) {
                throw new Error("Email is invalid");
            }
        }
    },
    password: {
        type: String,
        trim: true,
        required: true,
        validate(value) {
            if (value.length < 6) {
                throw new Error("Password Length Not Sufficent");
            }
        }
    },
    tokens: [{
            token: {
                type: String,
                required: true
            },
            uuid: {
                type: String,
                required: true,
            },
            time: {
                type: Number,
                required: true
            }
        }],
    tempTokens: [{
            token: {
                type: String,
                required: true
            },
            uuid: {
                type: String,
                required: true,
            },
            time: {
                type: Number,
                required: true
            }
        }],
    privateKey: {
        type: String,
    },
    publicKey: {
        type: String,
    },
    emailVerified: {
        type: Boolean
    },
    emailToken: {
        type: String,
    },
    passwordResetToken: {
        type: String
    },
    googleDriveEnabled: {
        type: Boolean
    },
    googleDriveData: {
        id: {
            type: String
        },
        key: {
            type: String
        },
        iv: {
            type: Buffer
        },
        token: {
            type: String
        }
    },
    s3Enabled: {
        type: Boolean
    },
    s3Data: {
        id: {
            type: String
        },
        key: {
            type: String
        },
        bucket: {
            type: String
        },
        iv: {
            type: Buffer
        }
    },
    personalStorageCanceledDate: Number,
    storageData: {
        storageSize: Number,
        storageLimit: Number,
        failed: Boolean,
    },
    storageDataPersonal: {
        storageSize: Number,
        failed: Boolean,
    },
    storageDataGoogle: {
        storageSize: Number,
        storageLimit: Number,
        failed: Boolean,
    },
    activeSubscription: Boolean,
    planID: String,
    passwordLastModified: Number,
    lastSubscriptionCheckTime: Number,
    lastSubscriptionStatus: Boolean
}, {
    timestamps: true
});
const maxAgeAccess = 60 * 1000 * 20 + (1000 * 60);
const maxAgeRefresh = 60 * 1000 * 60 * 24 * 30 + (1000 * 60);
const maxAgeAccessStreamVideo = 60 * 1000 * 60 * 24;
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        if (user.isModified("password")) {
            user.password = yield bcrypt_1.default.hash(user.password, 8);
        }
        next();
    });
});
userSchema.statics.findByCreds = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Incorrect password");
    }
    return user;
});
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.tempTokens;
    delete userObject.privateKey;
    delete userObject.publicKey;
    return userObject;
};
userSchema.methods.generateAuthTokenStreamVideo = function (uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        const iv = crypto_1.default.randomBytes(16);
        const user = this;
        const date = new Date();
        const time = date.getTime();
        let accessTokenStreamVideo = jsonwebtoken_1.default.sign({ _id: user._id.toString(), iv, time }, env_1.default.passwordAccess, { expiresIn: maxAgeAccessStreamVideo.toString() });
        const encryptionKey = user.getEncryptionKey();
        const encryptedToken = user.encryptToken(accessTokenStreamVideo, encryptionKey, iv);
        uuid = uuid ? uuid : "unknown";
        yield User.updateOne({ _id: user._id }, { $push: { "tempTokens": { token: encryptedToken, uuid, time } } });
        return accessTokenStreamVideo;
    });
};
userSchema.methods.generateAuthToken = function (uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        const iv = crypto_1.default.randomBytes(16);
        const user = this;
        const date = new Date();
        const time = date.getTime();
        const userObj = { _id: user._id, emailVerified: user.emailVerified || env_1.default.disableEmailVerification, email: user.email, s3Enabled: user.s3Enabled, googleDriveEnabled: user.googleDriveEnabled };
        let accessToken = jsonwebtoken_1.default.sign({ user: userObj, iv }, env_1.default.passwordAccess, { expiresIn: maxAgeAccess.toString() });
        let refreshToken = jsonwebtoken_1.default.sign({ _id: user._id.toString(), iv, time }, env_1.default.passwordRefresh, { expiresIn: maxAgeRefresh.toString() });
        const encryptionKey = user.getEncryptionKey();
        const encryptedToken = user.encryptToken(refreshToken, encryptionKey, iv);
        //user.tokens = user.tokens.concat({token: encryptedToken});
        uuid = uuid ? uuid : "unknown";
        yield User.updateOne({ _id: user._id }, { $push: { "tokens": { token: encryptedToken, uuid, time } } });
        // console.log("saving user")
        // console.log("user saved")
        return { accessToken, refreshToken };
        // const iv = crypto.randomBytes(16);
        // const user = this; 
        // let token = jwt.sign({_id:user._id.toString(), iv}, env.passwordAccess!);
        // const encryptionKey = user.getEncryptionKey();
        // const encryptedToken = user.encryptToken(token, encryptionKey, iv);
        // user.tokens = user.tokens.concat({token: encryptedToken});
        // await user.save();
        // return token;
    });
};
userSchema.methods.encryptToken = function (token, key, iv) {
    iv = Buffer.from(iv, "hex");
    const TOKEN_CIPHER_KEY = crypto_1.default.createHash('sha256').update(key).digest();
    const cipher = crypto_1.default.createCipheriv('aes-256-cbc', TOKEN_CIPHER_KEY, iv);
    const encryptedText = cipher.update(token);
    return Buffer.concat([encryptedText, cipher.final()]).toString("hex");
    ;
};
userSchema.methods.decryptToken = function (encryptedToken, key, iv) {
    encryptedToken = Buffer.from(encryptedToken, "hex");
    iv = Buffer.from(iv, "hex");
    const TOKEN_CIPHER_KEY = crypto_1.default.createHash('sha256').update(key).digest();
    const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', TOKEN_CIPHER_KEY, iv);
    const tokenDecrypted = decipher.update(encryptedToken);
    return Buffer.concat([tokenDecrypted, decipher.final()]).toString();
};
userSchema.methods.generateEncryptionKeys = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const userPassword = user.password;
        const masterPassword = env_1.default.key;
        const randomKey = crypto_1.default.randomBytes(32);
        const iv = crypto_1.default.randomBytes(16);
        const USER_CIPHER_KEY = crypto_1.default.createHash('sha256').update(userPassword).digest();
        const cipher = crypto_1.default.createCipheriv('aes-256-cbc', USER_CIPHER_KEY, iv);
        let encryptedText = cipher.update(randomKey);
        encryptedText = Buffer.concat([encryptedText, cipher.final()]);
        const MASTER_CIPHER_KEY = crypto_1.default.createHash('sha256').update(masterPassword).digest();
        const masterCipher = crypto_1.default.createCipheriv('aes-256-cbc', MASTER_CIPHER_KEY, iv);
        const masterEncryptedText = masterCipher.update(encryptedText);
        user.privateKey = Buffer.concat([masterEncryptedText, masterCipher.final()]).toString("hex");
        user.publicKey = iv.toString("hex");
        yield user.save();
    });
};
userSchema.methods.getEncryptionKey = function () {
    try {
        const user = this;
        const userPassword = user.password;
        const masterEncryptedText = user.privateKey;
        const masterPassword = env_1.default.key;
        const iv = Buffer.from(user.publicKey, "hex");
        const USER_CIPHER_KEY = crypto_1.default.createHash('sha256').update(userPassword).digest();
        const MASTER_CIPHER_KEY = crypto_1.default.createHash('sha256').update(masterPassword).digest();
        const unhexMasterText = Buffer.from(masterEncryptedText, "hex");
        const masterDecipher = crypto_1.default.createDecipheriv('aes-256-cbc', MASTER_CIPHER_KEY, iv);
        let masterDecrypted = masterDecipher.update(unhexMasterText);
        masterDecrypted = Buffer.concat([masterDecrypted, masterDecipher.final()]);
        let decipher = crypto_1.default.createDecipheriv('aes-256-cbc', USER_CIPHER_KEY, iv);
        let decrypted = decipher.update(masterDecrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted;
    }
    catch (e) {
        console.log("Get Encryption Key Error", e);
        return undefined;
    }
};
userSchema.methods.changeEncryptionKey = function (randomKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const userPassword = user.password;
        const masterPassword = env_1.default.key;
        const iv = crypto_1.default.randomBytes(16);
        const USER_CIPHER_KEY = crypto_1.default.createHash('sha256').update(userPassword).digest();
        const cipher = crypto_1.default.createCipheriv('aes-256-cbc', USER_CIPHER_KEY, iv);
        let encryptedText = cipher.update(randomKey);
        encryptedText = Buffer.concat([encryptedText, cipher.final()]);
        const MASTER_CIPHER_KEY = crypto_1.default.createHash('sha256').update(masterPassword).digest();
        const masterCipher = crypto_1.default.createCipheriv('aes-256-cbc', MASTER_CIPHER_KEY, iv);
        const masterEncryptedText = masterCipher.update(encryptedText);
        user.privateKey = Buffer.concat([masterEncryptedText, masterCipher.final()]).toString("hex");
        user.publicKey = iv.toString("hex");
        yield user.save();
    });
};
userSchema.methods.generateTempAuthToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const iv = crypto_1.default.randomBytes(16);
        const user = this;
        const token = jsonwebtoken_1.default.sign({ _id: user._id.toString(), iv }, env_1.default.passwordAccess, { expiresIn: "3000ms" });
        const encryptionKey = user.getEncryptionKey();
        const encryptedToken = user.encryptToken(token, encryptionKey, iv);
        user.tempTokens = user.tempTokens.concat({ token: encryptedToken });
        yield user.save();
        return token;
    });
};
userSchema.methods.generateEmailVerifyToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const iv = crypto_1.default.randomBytes(16);
        const user = this;
        const token = jsonwebtoken_1.default.sign({ _id: user._id.toString(), iv }, env_1.default.passwordAccess, { expiresIn: "1d" });
        const encryptionKey = user.getEncryptionKey();
        const encryptedToken = user.encryptToken(token, encryptionKey, iv);
        user.emailToken = encryptedToken;
        yield user.save();
        return token;
    });
};
userSchema.methods.encryptDriveIDandKey = function (ID, key) {
    return __awaiter(this, void 0, void 0, function* () {
        const iv = crypto_1.default.randomBytes(16);
        const user = this;
        const encryptedKey = user.getEncryptionKey();
        const encryptedDriveID = user.encryptToken(ID, encryptedKey, iv);
        const encryptedDriveKey = user.encryptToken(key, encryptedKey, iv);
        if (!user.googleDriveData)
            user.googleDriveData = {};
        user.googleDriveData.id = encryptedDriveID;
        user.googleDriveData.key = encryptedDriveKey;
        user.googleDriveData.iv = iv;
        yield user.save();
    });
};
userSchema.methods.decryptDriveIDandKey = function () {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const iv = user.googleDriveData.iv;
        const encryptedKey = user.getEncryptionKey();
        const encryptedDriveID = (_a = user.googleDriveData) === null || _a === void 0 ? void 0 : _a.id;
        const encryptedDriveKey = (_b = user.googleDriveData) === null || _b === void 0 ? void 0 : _b.key;
        const decryptedDriveID = user.decryptToken(encryptedDriveID, encryptedKey, iv);
        const decryptedDriveKey = user.decryptToken(encryptedDriveKey, encryptedKey, iv);
        return {
            clientID: decryptedDriveID,
            clientKey: decryptedDriveKey
        };
    });
};
userSchema.methods.encryptDriveTokenData = function (token) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const iv = (_a = user.googleDriveData) === null || _a === void 0 ? void 0 : _a.iv;
        const tokenToString = JSON.stringify(token);
        const encryptedKey = user.getEncryptionKey();
        const encryptedDriveToken = user.encryptToken(tokenToString, encryptedKey, iv);
        ;
        if (!user.googleDriveData)
            user.googleDriveData = {};
        user.googleDriveData.token = encryptedDriveToken;
        user.googleDriveEnabled = true;
        yield user.save();
    });
};
userSchema.methods.decryptDriveTokenData = function () {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const iv = user.googleDriveData.iv;
        const encryptedKey = user.getEncryptionKey();
        const encryptedToken = (_a = user.googleDriveData) === null || _a === void 0 ? void 0 : _a.token;
        const decryptedToken = user.decryptToken(encryptedToken, encryptedKey, iv);
        const tokenToObj = JSON.parse(decryptedToken);
        return tokenToObj;
    });
};
userSchema.methods.encryptS3Data = function (ID, key, bucket) {
    return __awaiter(this, void 0, void 0, function* () {
        const iv = crypto_1.default.randomBytes(16);
        const user = this;
        const encryptedKey = user.getEncryptionKey();
        const encryptedS3ID = user.encryptToken(ID, encryptedKey, iv);
        const encryptedS3Key = user.encryptToken(key, encryptedKey, iv);
        const encryptedS3Bucket = user.encryptToken(bucket, encryptedKey, iv);
        if (!user.s3Data)
            user.s3Data = {};
        user.s3Data.id = encryptedS3ID;
        user.s3Data.key = encryptedS3Key;
        user.s3Data.bucket = encryptedS3Bucket;
        user.s3Data.iv = iv;
        user.s3Enabled = true;
        yield user.save();
    });
};
userSchema.methods.decryptS3Data = function () {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const iv = (_a = user.s3Data) === null || _a === void 0 ? void 0 : _a.iv;
        const encryptedKey = user.getEncryptionKey();
        const encrytpedS3ID = (_b = user.s3Data) === null || _b === void 0 ? void 0 : _b.id;
        const encryptedS3Key = (_c = user.s3Data) === null || _c === void 0 ? void 0 : _c.key;
        const encryptedS3Bucket = (_d = user.s3Data) === null || _d === void 0 ? void 0 : _d.bucket;
        const decrytpedS3ID = user.decryptToken(encrytpedS3ID, encryptedKey, iv);
        const decryptedS3Key = user.decryptToken(encryptedS3Key, encryptedKey, iv);
        const decryptedS3Bucket = user.decryptToken(encryptedS3Bucket, encryptedKey, iv);
        //console.log("decrypted keys", decrytpedS3ID, decryptedS3Key, decryptedS3Bucket);
        return {
            id: decrytpedS3ID,
            key: decryptedS3Key,
            bucket: decryptedS3Bucket,
        };
    });
};
userSchema.methods.generatePasswordResetToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const iv = crypto_1.default.randomBytes(16);
        const user = this;
        const token = jsonwebtoken_1.default.sign({ _id: user._id.toString(), iv }, env_1.default.passwordAccess, { expiresIn: "1h" });
        const encryptionKey = user.getEncryptionKey();
        const encryptedToken = user.encryptToken(token, encryptionKey, iv);
        user.passwordResetToken = encryptedToken;
        yield user.save();
        return token;
    });
};
userSchema.methods.generateTempAuthTokenVideo = function (cookie) {
    return __awaiter(this, void 0, void 0, function* () {
        const iv = crypto_1.default.randomBytes(16);
        const user = this;
        const token = jsonwebtoken_1.default.sign({ _id: user._id.toString(), cookie, iv }, env_1.default.passwordAccess, { expiresIn: "5h" });
        const encryptionKey = user.getEncryptionKey();
        const encryptedToken = user.encryptToken(token, encryptionKey, iv);
        user.tempTokens = user.tempTokens.concat({ token: encryptedToken });
        yield user.save();
        return token;
    });
};
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
module.exports = User;
