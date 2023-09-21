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
const getEnvVariables_1 = __importDefault(require("../enviroment/getEnvVariables"));
getEnvVariables_1.default();
const getKey_1 = __importDefault(require("../key/getKey"));
const server_1 = __importDefault(require("./server"));
const { server, serverHttps } = server_1.default;
const serverStart = () => __awaiter(void 0, void 0, void 0, function* () {
    yield getKey_1.default();
    console.log("ENV", process.env.NODE_ENV);
    if (process.env.NODE_ENV === 'production' && process.env.SSL === "true") {
        server.listen(process.env.HTTP_PORT, process.env.URL, () => {
            console.log("Http Server Running On Port:", process.env.HTTP_PORT);
        });
        serverHttps.listen(process.env.HTTPS_PORT, function () {
            console.log('Https Server Running On Port:', process.env.HTTPS_PORT);
        });
    }
    else if (process.env.NODE_ENV === 'production') {
        const port = process.env.HTTP_PORT || process.env.PORT;
        server.listen(port, process.env.URL, () => {
            console.log("Http Server (No-SSL) Running On Port:", port);
        });
    }
    else {
        const port = process.env.HTTP_PORT || process.env.PORT;
        server.listen(port, process.env.URL, () => {
            console.log("Development Server Running On Port:", port);
        });
    }
});
serverStart();
