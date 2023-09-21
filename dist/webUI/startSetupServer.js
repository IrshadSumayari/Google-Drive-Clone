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
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const fs_1 = __importDefault(require("fs"));
const app = express_1.default();
const getWebUIKey = () => {
    console.log("Starting Server...\n");
    const publicPath = path_1.default.join(__dirname, "..", "..", "webUISetup");
    return new Promise((resolve, reject) => {
        app.use(express_1.default.static(publicPath));
        app.use(express_1.default.json());
        app.use(body_parser_1.default.json({ limit: "50mb" }));
        app.use(body_parser_1.default.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
        app.post("/submit", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            console.log("Response");
            yield createConfigFiles(req.body.clientObj, req.body.serverObj);
            res.send();
        }));
        app.get("*", (req, res) => {
            res.sendFile(path_1.default.join(publicPath, "index.html"));
        });
        const port = process.env.HTTP_PORT || process.env.PORT || "3000";
        const url = process.env.DOCKER ? undefined : "localhost";
        const server = http_1.default.createServer(app);
        server.listen(port, () => {
            console.log(`\nPlease navigate to http://localhost:${port} to enter setup details\n`);
        });
    });
};
const awaitcreateDir = (path) => {
    return new Promise((resolve, reject) => {
        fs_1.default.mkdir(path, () => {
            resolve();
        });
    });
};
const awaitWriteFile = (path, data) => {
    return new Promise((resolve, reject) => {
        fs_1.default.writeFile(path, data, (err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.log("file write error", err);
                reject();
            }
            resolve();
        }));
    });
};
const createConfigFiles = (clientObj, serverObj) => __awaiter(void 0, void 0, void 0, function* () {
    yield awaitcreateDir("./config");
    let totalClientString = "";
    let totalServerString = "";
    for (let currentKey in clientObj) {
        totalClientString += `${currentKey}=${clientObj[currentKey]}\n`;
    }
    for (let currentKey in serverObj) {
        totalServerString += `${currentKey}=${serverObj[currentKey]}\n`;
    }
    if (serverObj.DOCKER) {
        const combinedStrings = totalClientString + totalServerString;
        yield awaitWriteFile("./docker-variables.env", combinedStrings);
    }
    else {
        yield awaitWriteFile("./.env.production", totalClientString);
        yield awaitWriteFile("./config/prod.env", totalServerString);
    }
    console.log("File(s) Created");
});
getWebUIKey();
