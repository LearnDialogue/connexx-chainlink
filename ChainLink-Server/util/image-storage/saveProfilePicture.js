const path = require('path');
const fs = require('fs');
const { pipeline } = require('stream/promises');
const { uploadToS3, deleteFromS3 } = require('./S3upload.js');

async function saveProfilePicture(file, username) {
  const { createReadStream, filename } = file;

  await deleteOldProfilePictures(username);

  if (process.env.STORAGE_TYPE === 's3') {
    // For S3, you might want to save to temp file first or stream directly
    const tempPath = `/tmp/${Date.now()}-${filename}`;
    const stream = createReadStream();
    await pipeline(stream, fs.createWriteStream(tempPath));

    const url = await uploadToS3({
      path: tempPath,
      filename: `${username}-${Date.now()}-${filename}`,
    });
    fs.unlinkSync(tempPath); // cleanup
    return url;
  } else {
    // Local storage
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const newFilename = `${username}-${Date.now()}-${filename}`;
    const filePath = path.join(uploadDir, newFilename);
    const stream = createReadStream();

    await pipeline(stream, fs.createWriteStream(filePath));

    return `/uploads/${newFilename}`;
  }
}

async function deleteOldProfilePictures(username) {
  if (process.env.STORAGE_TYPE === 's3') {
    // Delete from S3
    try {
      const prefix = `profile-pictures/${username}`;
      await deleteFromS3(prefix);
      console.log(`🗑️  Deleted old S3 profile pictures for ${username}`);
    } catch (err) {
      console.log('No old S3 profile pictures to delete or error:', err.message);
    }
  } else {
    // Delete from local storage
    try {
      const uploadDir = path.join(process.cwd(), 'uploads');

      if (!fs.existsSync(uploadDir)) {
        console.log('Upload directory does not exist');
        return;
      }

      const files = fs.readdirSync(uploadDir);
      const userFiles = files.filter(
        (f) => f.startsWith(`${username}.`) || f.startsWith(`${username}-`)
      );

      for (const file of userFiles) {
        fs.unlinkSync(path.join(uploadDir, file));
      }
    } catch (err) {
      console.log('No old local profile pictures to delete or error:', err.message);
    }
  }
}

async function getProfilePicture(username, res) {
  if (process.env.STORAGE_TYPE === 's3') {
    const s3Url = `${process.env.S3_BUCKET_URL}/profile-pictures/${username}.jpg`;
    return res.json({ imageUrl: s3Url });
  } else {
    const uploadDir = path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(uploadDir)) {
      return res.status(404).json({ error: 'Upload directory not found' });
    }

    const files = fs.readdirSync(uploadDir);
    const userFile = files.find(
      (f) => f.startsWith(`${username}.`) || f.startsWith(`${username}-`)
    );

    if (!userFile) {
      return res.status(404).json({ error: 'Profile picture file not found' });
    }

    const imageUrl = `/uploads/profile-pictures/${userFile}`;
    return res.json({ imageUrl });
  }
}

module.exports = {
  saveProfilePicture,
  deleteOldProfilePictures,
  getProfilePicture,
};
