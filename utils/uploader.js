'use strict'
// Get dependencies
const AWS = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
var config = require('../config/config.json')
var path = require('path');
var mime = require('mime-types');
const { MulterError } = require('multer')
// const fs = require("fs-extra");
// AWS.config.update({
//     secretAccessKey: config.aws.aws_secret_access_key,
//     accessKeyId: config.aws.aws_access_key_id,
//     region: config.aws.s3.region,
//     useAccelerateEndpoint: config.aws.s3.useAccelerateEndpoint
// });
// const s3 = new AWS.S3();

// let storage = multerS3({
//     // acl: 'public-read',
//     s3: s3,
//     bucket: config.aws.s3.staging.bucket,
//     key: function (req, file, cb) {
//         let folderName
//         // if (process.env.NODE_ENV === "staging") {
//         //     folderName = `uploads_staging`;
//         // } else if (process.env.NODE_ENV === "localhost") {
//         //     folderName = `uploads_local`;
//         // } else {
//         //     folderName = `uploads`;
//         // }
//         folderName = `uploads_${process.env.NODE_ENV}`;
//         // let imagePath = Date.now() + "." + mime.extension(file.mimetype);
//         let imagePath = folderName + "/" + Date.now() + "." + mime.extension(file.mimetype);

//         // fs.mkdirsSync(folderName);
//         cb(null, imagePath);
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + "." + mime.extension(file.mimetype));
//     }
// });

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) { cb(null, __dirname + "/uploads/"); },
        filename: function (req, file, cb) { cb(null, Date.now() + "_" + Math.random().toString(36).substring(2) + "." + mime.extension(file.mimetype)); }
    }),
    // storage: storage,
    fileFilter: function (req, files, callback, next) {
        let outOfScopeExt = false;
        let allowed = [];
        let type = files.fieldname;
        console.log("**********************************");
        console.log('files:', files);
        if (type && (type === 'image' || type === 'images')) { allowed = ['.png', '.bmp', '.ico', '.gif', '.jpg', '.jpeg']; }
        else if (type && type === 'video') { allowed = ['.mp3', '.mp4', '.gif', '.mkv', '.flv']; }
        else if (type && (type === 'file')) { allowed = ['.csv', '.xlsx', '.xls', '.pdf']; }
        else if (type && (type === 'document')) { allowed = ['.docx', '.doc', '.odt', '.csv', '.xlsx', '.xls', '.pdf', '.png', '.bmp', '.ico', '.gif', '.jpg', '.jpeg']; }

        const ext = String(path.extname(files.originalname))
            .trim()
            .toLowerCase();
        console.log('ext', ext);
        if (allowed.toString().indexOf(ext) > -1) {
            console.log('allowed:', allowed);
            if (outOfScopeExt)
                req.multerFileUploadSuccess = false;
            else
                req.multerFileUploadSuccess = true;
            callback(null, true);
        } else {
            console.log('allowed::', allowed);
            outOfScopeExt = true;
            req.multerFileUploadSuccess = false;
            let err = new MulterError("file_format_error")
            return callback(err, false);
        }
    },
    limits: {
        fileSize: 4 * 1024 * 1024
    }
});

module.exports = {
    upload,
}