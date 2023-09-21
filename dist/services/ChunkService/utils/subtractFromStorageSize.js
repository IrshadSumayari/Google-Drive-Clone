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
const user_1 = __importDefault(require("../../../models/user"));
const subtractFromStorageSize = (userID, size, isPersonalFile) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield user_1.default.findById(userID);
    if (isPersonalFile) {
        user.storageDataPersonal.storageSize = +user.storageDataPersonal.storageSize - +size;
        if (user.storageDataPersonal.storageSize < 0)
            user.storageDataPersonal.storageSize = 0;
        yield user.save();
        return;
    }
    if (!user.storageData || (!user.storageData.storageSize && !user.storageData.storageLimit))
        user.storageData = { storageSize: 0, storageLimit: 0 };
    user.storageData.storageSize = +user.storageData.storageSize - +size;
    if (((_a = user.storageData) === null || _a === void 0 ? void 0 : _a.storageSize) < 0)
        user.storageData.storageSize = 0;
    yield user.save();
});
exports.default = subtractFromStorageSize;
