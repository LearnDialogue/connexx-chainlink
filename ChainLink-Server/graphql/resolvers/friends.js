const Friend = require('../../models/Friend'); // Import the Friend model

module.exports = {
  Query: {
    async checkFriendStatus(_, { senderId, recipientId }) {
      try {
        const friendStatus = await Friend.findOne({
          $or: [
            { sender: senderId, recipient: recipientId },
            { sender: recipientId, recipient: senderId },
          ],
        });
        return friendStatus;
      } catch (error) {
        console.error('Error checking friend status:', error);
        throw new Error('Failed to check friend status.');
      }
    },

    async getFriends(_, { userId }) {
      try {
        const friends = await Friend.find({
          $or: [
            { sender: userId },
            { recipient: userId },
          ],
          status: 'accepted',
        }).populate('sender recipient');
        return friends;
      } catch (error) {
        console.error('Error fetching friends:', error);
        throw new Error('Failed to fetch friends.');
      }
    },

    async getFriendRequests(_, { userId }) {
      try {
        const friendRequests = await Friend.find({
          recipient: userId,
          status: 'pending',
        }).populate('sender recipient');
        return friendRequests;
      } catch (error) {
        console.error('Error fetching friend requests:', error);
        throw new Error('Failed to fetch friend requests.');
      }
    },
  },

  Mutation: {
    async addFriend(_, { senderId, recipientId }) {
      try {
        // Check if the friend request already exists
        const existingRequest = await Friend.findOne({
          $or: [
            { sender: senderId, recipient: recipientId },
            { sender: recipientId, recipient: senderId },
          ],
        });

        if (existingRequest) {
          throw new Error('Friend request already exists.');
        }

        // Create a new friend request
        const newFriendRequest = new Friend({
          sender: senderId,
          recipient: recipientId,
          status: 'pending',
        });

        const res = await newFriendRequest.save();
        return res;
      } catch (error) {
        console.error('Error adding friend:', error);
        throw new Error('Failed to add friend.');
      }
    },
    // Other mutations...
  },
};