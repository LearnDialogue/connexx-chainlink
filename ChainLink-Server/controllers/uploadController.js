const { Readable } = require('stream');
const fs = require('fs');
const path = require('path');
const User = require('../models/User.js');
const { saveProfilePicture } = require('../util/image-storage/saveProfilePicture.js');

async function uploadProfilePicture(req, res) {
  try {
    const { username } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Convert buffer to stream
    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);

    // Save the profile picture
    const savedUrl = await saveProfilePicture(
      {
        createReadStream: () => bufferStream,
        filename: file.originalname,
        mimetype: file.mimetype,
      },
      username
    );

    // Update user in database
    const user = await User.findOneAndUpdate(
      { username },
      { hasProfileImage: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ imageUrl: savedUrl });
  } catch (error) {
    console.error('Error saving profile picture:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function getProfilePicture(req, res) {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const user = await User.findOne({ username });

    if (!user || !user.hasProfileImage) {
      return res.status(404).json({ error: 'No profile picture found' });
    }

    if (process.env.STORAGE_TYPE === 's3') {
      const s3Url = `${process.env.S3_BUCKET_URL}/profile-pictures/${username}.jpg`;
      return res.json({ imageUrl: s3Url });
    } else {
      const uploadDir = path.join(process.cwd(), 'uploads');

      if (!fs.existsSync(uploadDir)) {
        return res.status(404).json({ error: 'Upload directory not found' });
      }

      const files = fs.readdirSync(uploadDir);
      const userFile = files.find((f) => {
        const pattern = new RegExp(`^${username}-`);
        return pattern.test(f) && f.split('-')[0] === username;
      });

      if (!userFile) {
        return res.status(404).json({ error: 'Profile picture file not found' });
      }

      const imageUrl = `/uploads/${userFile}`;
      return res.json({ imageUrl });
    }
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  uploadProfilePicture,
  getProfilePicture,
};
