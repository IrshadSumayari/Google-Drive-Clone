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
const env_1 = __importDefault(require("../enviroment/env"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
const sendVerificationEmail = (user, emailToken) => __awaiter(void 0, void 0, void 0, function* () {
    if (process.env.NODE_ENV === "test") {
        return;
    }
    const apiKey = env_1.default.sendgridKey;
    const sendgridEmail = env_1.default.sendgridEmail;
    const url = env_1.default.remoteURL + `/verify-email/${emailToken}`;
    // console.log("send grid api key", apiKey)
    // console.log("send grid email", sendgridEmail);
    // console.log("send grid verify url", url)
    mail_1.default.setApiKey(apiKey);
    const msg = {
        to: user.email,
        from: sendgridEmail,
        subject: "myDrive Email Verification",
        text: `Please navigate to the following link to verify your email address: ${url}`
    };
    yield mail_1.default.send(msg);
    //console.log("Send grid email sent");
});
exports.default = sendVerificationEmail;
