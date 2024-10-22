const Friend = require('../../models/Friend'); // Import the Friend model

module.exports = {
  Query: {
    async checkFriendStatus(_, { senderId, recipientId }) {
      try {
        // Find the friend request between the sender and recipient
        const friendRequest = await Friend.findOne({
          sender: senderId,
          recipient: recipientId,
        });

        if (!friendRequest) {
          return { status: null }; // No friend request found
        }

        // Return the status of the friend request
        return { status: friendRequest.status };
      } catch (error) {
        console.error('Error checking friend status:', error);
        throw new Error('Failed to check friend status.');
      }
    },
  },
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
