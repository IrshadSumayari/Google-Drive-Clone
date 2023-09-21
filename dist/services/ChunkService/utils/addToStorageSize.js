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
Object.defineProperty(exports, "__esModule", { value: true });
const addToStoageSize = (user, size, isPersonalFile) => __awaiter(void 0, void 0, void 0, function* () {
    if (isPersonalFile) {
        //console.log("user storage")
        user.storageDataPersonal.storageSize = +user.storageDataPersonal.storageSize + +size;
        yield user.save();
        return;
    }
    if (!user.storageData || (!user.storageData.storageSize && !user.storageData.storageLimit))
        user.storageData = { storageSize: 0, storageLimit: 0 };
    user.storageData.storageSize = +user.storageData.storageSize + +size;
    yield user.save();
});
exports.default = addToStoageSize;
