"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const createQuery = (owner, parent, sortBy, startAt, startAtDate, searchQuery, s3Enabled, startAtName, storageType, folderSearch) => {
    let query = { "metadata.owner": new mongodb_1.ObjectID(owner) };
    if (searchQuery !== "") {
        searchQuery = new RegExp(searchQuery, 'i');
        query = Object.assign(Object.assign({}, query), { filename: searchQuery });
        if (parent !== "/" || folderSearch)
            query = Object.assign(Object.assign({}, query), { "metadata.parent": parent });
        //if (parent === "home") query = {...query, "metadata.parent": "/"};
    }
    else {
        query = Object.assign(Object.assign({}, query), { "metadata.parent": parent });
    }
    if (startAt) {
        if (sortBy === "date_desc" || sortBy === "DEFAULT") {
            query = Object.assign(Object.assign({}, query), { "uploadDate": { $lt: new Date(startAtDate) } });
        }
        else if (sortBy === "date_asc") {
            query = Object.assign(Object.assign({}, query), { "uploadDate": { $gt: new Date(startAtDate) } });
        }
        else if (sortBy === "alp_desc") {
            query = Object.assign(Object.assign({}, query), { "filename": { $lt: startAtName } });
        }
        else {
            query = Object.assign(Object.assign({}, query), { "filename": { $gt: startAtName } });
        }
    }
    // if (s3Enabled) {
    //     query = {...query, "metadata.personalFile": true}
    // } else 
    if (!s3Enabled) {
        query = Object.assign(Object.assign({}, query), { "metadata.personalFile": null });
    }
    // if (storageType === "s3") {
    //     query = {...query, "metadata.personalFile": true}
    // }
    return query;
};
exports.default = createQuery;
