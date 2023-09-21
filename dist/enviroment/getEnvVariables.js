"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const getEnvVariables = () => {
    const configPath = path_1.default.join(__dirname, "..", "..", "config");
    const processType = process.env.NODE_ENV;
    if (processType === 'production' || processType === undefined) {
        require('dotenv').config({ path: configPath + "/prod.env" });
    }
    else if (processType === 'development') {
        require('dotenv').config({ path: configPath + "/dev.env" });
    }
    else if (processType === 'test') {
        require('dotenv').config({ path: configPath + "/test.env" });
    }
};
exports.default = getEnvVariables;
module.exports = getEnvVariables;
