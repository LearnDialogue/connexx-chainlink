const AWS = require('aws-sdk');
const fs = require('fs');

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

async function uploadToS3(file) {
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

async function deleteFromS3(prefix) {
  try {
    const listParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: prefix,
    };

    const listedObjects = await s3.listObjectsV2(listParams).promise();

    if (listedObjects.Contents.length === 0) return;

    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Delete: {
        Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
      },
    };

    await s3.deleteObjects(deleteParams).promise();

    // If there are more objects to delete, recurse
    if (listedObjects.IsTruncated) await deleteFromS3(prefix);
  } catch (err) {
    console.error('Error deleting from S3:', err);
  }
}

module.exports = {
  uploadToS3,
  deleteFromS3,
};
