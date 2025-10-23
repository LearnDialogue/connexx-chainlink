import AWS from 'aws-sdk';
import fs from 'fs';

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export async function uploadToS3(file) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `profile-pics/${file.filename}`,
    Body: fs.createReadStream(file.path),
    ACL: 'public-read',
  };

  const result = await s3.upload(params).promise();
  fs.unlinkSync(file.path); // delete temp file
  return result.Location; // public URL
}