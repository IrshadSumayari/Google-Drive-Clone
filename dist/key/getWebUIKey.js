"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = express_1.default();
const getWebUIKey = () => {
    const publicPath = path_1.default.join(__dirname, "..", "..", "webUI");
    return new Promise((resolve, reject) => {
        app.use(express_1.default.static(publicPath));
        app.use(express_1.default.json());
        app.use(body_parser_1.default.json({ limit: "50mb" }));
        app.use(body_parser_1.default.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
        app.post("/submit", (req, res) => {
            const password = req.body.password;
            if (password && password.length > 0) {
                console.log("Got WebUI key");
                res.send();
                server.close();
                resolve(password);
            }
        });
        app.get("*", (req, res) => {
            res.sendFile(path_1.default.join(publicPath, "index.html"));
        });
        const port = process.env.HTTP_PORT || process.env.PORT || "3000";
        const url = process.env.DOCKER ? undefined : "localhost";
        const server = http_1.default.createServer(app);
        server.listen(port, () => {
            console.log(`\nPlease navigate to http://localhost:${port} to enter encryption key\n`);
        });
    });
};
exports.default = getWebUIKey;
