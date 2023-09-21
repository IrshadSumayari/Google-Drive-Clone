"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = __importDefault(require("../enviroment/env"));
const fs_1 = __importDefault(require("fs"));
const DBUrl = env_1.default.mongoURL;
if (env_1.default.useDocumentDB === "true") {
    console.log("Using DocumentDB");
    if (env_1.default.documentDBBundle === "true") {
        const fileBuffer = fs_1.default.readFileSync('./rds-combined-ca-bundle.pem');
        const mongooseCertificateConnect = mongoose_1.default;
        mongooseCertificateConnect.connect(DBUrl, {
            useCreateIndex: true,
            useUnifiedTopology: true,
            sslValidate: true,
            sslCA: fileBuffer
        });
    }
    else {
        mongoose_1.default.connect(DBUrl, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
            sslValidate: true,
        });
    }
}
else {
    mongoose_1.default.connect(DBUrl, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
    });
}
exports.default = mongoose_1.default;
