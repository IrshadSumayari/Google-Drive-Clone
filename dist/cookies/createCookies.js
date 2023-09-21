"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeStreamVideoCookie = exports.createStreamVideoCookie = exports.createLogoutCookie = exports.createLoginCookie = void 0;
const env_1 = __importDefault(require("../enviroment/env"));
const maxAgeAccess = 60 * 1000 * 20;
//const maxAgeAccess =  1000;
const maxAgeRefresh = 60 * 1000 * 60 * 24 * 30;
//const maxAgeRefresh = 1000;
const maxAgeStreamVideo = 60 * 1000 * 60 * 24;
const secureCookies = env_1.default.secureCookies ? env_1.default.secureCookies === "true" ? true : false : false;
exports.createLoginCookie = (res, accessToken, refreshToken) => {
    res.cookie("access-token", accessToken, {
        httpOnly: true,
        maxAge: maxAgeAccess,
        sameSite: "strict",
        secure: secureCookies
    });
    res.cookie("refresh-token", refreshToken, {
        httpOnly: true,
        maxAge: maxAgeRefresh,
        sameSite: "strict",
        secure: secureCookies
    });
};
exports.createLogoutCookie = (res) => {
    res.cookie("access-token", {}, {
        httpOnly: true,
        maxAge: 0,
        sameSite: "strict",
        secure: secureCookies
    });
    res.cookie("refresh-token", {}, {
        httpOnly: true,
        maxAge: 0,
        sameSite: "strict",
        secure: secureCookies
    });
};
exports.createStreamVideoCookie = (res, streamVideoAccessToken) => {
    res.cookie("video-access-token", streamVideoAccessToken, {
        httpOnly: true,
        maxAge: maxAgeStreamVideo,
        sameSite: "strict",
        secure: secureCookies
    });
};
exports.removeStreamVideoCookie = (res) => {
    res.cookie("video-access-token", {}, {
        httpOnly: true,
        maxAge: 0,
        sameSite: "strict",
        secure: secureCookies
    });
};
