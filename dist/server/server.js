"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const user_1 = __importDefault(require("../express-routers/user"));
const file_1 = __importDefault(require("../express-routers/file"));
const folder_1 = __importDefault(require("../express-routers/folder"));
const storage_1 = __importDefault(require("../express-routers/storage"));
const googleFile_1 = __importDefault(require("../express-routers/googleFile"));
const personalFile_1 = __importDefault(require("../express-routers/personalFile"));
const googleFolder_1 = __importDefault(require("../express-routers/googleFolder"));
const userGoogle_1 = __importDefault(require("../express-routers/userGoogle"));
const userPersonal_1 = __importDefault(require("../express-routers/userPersonal"));
const body_parser_1 = __importDefault(require("body-parser"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const helmet_1 = __importDefault(require("helmet"));
const connect_busboy_1 = __importDefault(require("connect-busboy"));
const compression_1 = __importDefault(require("compression"));
const http_1 = __importDefault(require("http"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = __importDefault(require("../enviroment/env"));
// import requestIp from "request-ip";
const app = express_1.default();
const publicPath = path_1.default.join(__dirname, "..", "..", "public");
let server;
let serverHttps;
if (process.env.SSL === 'true') {
    const cert = fs_1.default.readFileSync("certificate.crt");
    const ca = fs_1.default.readFileSync("certificate.ca-bundle");
    const key = fs_1.default.readFileSync("certificate.key");
    const options = {
        cert,
        ca,
        key
    };
    serverHttps = https_1.default.createServer(options, app);
}
server = http_1.default.createServer(app);
require("../db/mongoose");
app.use(cookie_parser_1.default(env_1.default.passwordCookie));
app.use(helmet_1.default());
app.use(compression_1.default());
app.use(express_1.default.json());
app.use(express_1.default.static(publicPath));
app.use(body_parser_1.default.json({ limit: "50mb" }));
app.use(body_parser_1.default.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
// app.use(requestIp.mw());
app.use(connect_busboy_1.default({
    highWaterMark: 2 * 1024 * 1024,
}));
app.use(user_1.default, file_1.default, folder_1.default, storage_1.default, googleFile_1.default, personalFile_1.default, googleFolder_1.default, userPersonal_1.default, userGoogle_1.default);
//const nodeMode = process.env.NODE_ENV ? "Production" : "Development/Testing";
//console.log("Node Enviroment Mode:", nodeMode);
app.get("*", (_, res) => {
    res.sendFile(path_1.default.join(publicPath, "index.html"));
});
exports.default = { server, serverHttps };
