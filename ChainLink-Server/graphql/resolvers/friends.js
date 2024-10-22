const Friend = require('../../models/Friend'); // Import the Friend model

module.exports = {
  Mutation: {
    async addFriend(_, { senderId, recipientId }) {
      try {
        // Check if the friend request already exists
        const existingRequest = await Friend.findOne({
          sender: senderId,
          recipient: recipientId
        });

        if (existingRequest) {
          return {
            success: false,
            message: 'Friend request already sent.'
          };
        }

        // Create a new friend request
        const newFriendRequest = new Friend({
          sender: senderId,
          recipient: recipientId,
          status: 'pending',
          created_at: new Date()
        });

        await newFriendRequest.save();

        return {
          success: true,
          message: 'Friend request sent successfully.',
          id: newFriendRequest._id,
          status: newFriendRequest.status,
          created_at: newFriendRequest.created_at
        };
      } catch (error) {
        console.error('Error sending friend request:', error);
        throw new Error('Failed to send friend request.');
      }
    }
  }
};
