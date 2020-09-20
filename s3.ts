import aws from "aws-sdk";

aws.config.update({
  accessKeyId: process.env.MyAwsId,
  secretAccessKey: process.env.MyAwsSecret,
  region: process.env.MyRegion,
});

// New S3 class
const s3 = new aws.S3();

module.exports = s3;
