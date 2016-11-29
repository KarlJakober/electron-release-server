/**
 * AWS Service
 *
 * Handles uploads & downloads of versions
 */
var AWS = require('aws-sdk');
var fs = require('fs');
var zlib = require('zlib');

var AWSService = {};
let config = { region: sails.config.aws.region };

if (sails.config.aws.ak) {
    config.accessKeyId = sails.config.aws.ak;
}

if (sails.config.aws.sk) {
    config.secretAccessKey = sails.config.aws.sk;
}

AWS.config.update(config);
var s3 = new AWS.S3();

AWSService.uploadFile = function (version, platform, file, callback) {

    var body = fs.createReadStream(file.fd);
    var key = platform + '/' + version + '/' + file.filename;
    var params = { Bucket: sails.config.aws.bucket, Key: key, Body: body, ACL: 'public-read' };

    s3.putObject(params, function (err, data) {
        var fileURL = '';
        var cf = sails.config.aws.cloudfrontURL;
        if (cf != null) {
            fileURL = cf + '/' + key;
        }
        else {
            var s3URL = sails.config.aws.s3URL;
            fileURL = s3URL + '/' + sails.config.aws.bucket + '/' + key;
        }
        callback(err, fileURL);
    });
};

AWSService.delete = function (version, platform, filename, callback) {
    var key = platform + '/' + version + '/' + filename;
    var params = { Bucket: sails.config.aws.bucket, Key: key };

    s3.deleteObject(params, function (err, data) {
        callback(err);

    });
};

module.exports = AWSService;
