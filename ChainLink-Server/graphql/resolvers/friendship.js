const friendship = require('../../models/Friendship');
const { handleGeneralError } = require('../../util/error-handling');

module.exports = {
    Query: {
        async getFriendships(_, { username }, context) {
            try {
                const friendships = await friendship.find({
                    $or: [
                        { sender: username },
                        { receiver: username },
                    ]
                });
                return friendships;
            } catch (err) {
                throw new Error(err);
            }
        },
        // get list of friends, both sender and receiver must have status 'accepted'
        // list should be a list of usernames
        async getFriends(_, { username }, context) {
            try {
                const friendships = await friendship.find({
                    $or: [
                        { sender: username, status: 'accepted' },
                        { receiver: username, status: 'accepted' },
                    ]
                });
                const friends = friendships.map(friendship => {
                    if (friendship.sender === username) {
                        return friendship.receiver;
                    } else {
                        return friendship.sender;
                    }
                });
                return friends;
            } catch (err) {
                throw new Error(err);
            }
        },
        async getFriendRequests(_, { username }, context) {
            try {
                const friendships = await friendship.find({
                    receiver: username,
                    status: 'pending',
                });
                return friendships;
            } catch (err) {
                throw new Error(err);
            }
        },
        async getFriendshipStatus(_, { sender, receiver }, context) {
            try {
                const friendshipRes = await friendship.findOne({
                    $or: [
                        { sender: sender, receiver: receiver },
                        { sender: receiver, receiver: sender },
                    ]
                });
        
                if (!friendshipRes) {
                    return null;
                }
        
                return friendshipRes;
            } catch (err) {
                handleGeneralError(err, 'Issue getting friendship status');
            }
        }
    },
    Mutation: {
        async sendFriendRequest(_, { sender, receiver }) {
          try {
            // Check if a friendship already exists between the sender and receiver
            const existingFriendship = await friendship.findOne({
              $or: [
                { sender: sender, receiver: receiver },
                { sender: receiver, receiver: sender },
              ],
            });
        
            if (existingFriendship) {
              throw new Error('Friendship already exists between these users.');
            }
        
            // Create a new friendship if none exists
            const newFriendship = new friendship({
              sender: sender,
              receiver: receiver,
              status: 'pending',
              createdAt: new Date().toISOString(),
            });
        
            const friendshipRes = await newFriendship.save();
            return friendshipRes;
          } catch (err) {
            throw new Error(err);
          }
        },
        async acceptFriendRequest(_, { sender, receiver }) {
          try {
            const friendshipRes = await friendship.findOneAndUpdate(
              { sender: sender, receiver: receiver, status: 'pending' },
              {
              $set: { status: 'accepted' },
              },
              { new: true }
            );

            if (!friendshipRes) {
                throw new Error('Friend request not found.');
            }
        
            return friendshipRes;
          } catch (err) {
            throw new Error(err);
          }
        },
        // decline friend request, set status to 'declined'
        async declineFriendRequest(_, { sender, receiver }) {
            try {
                const friendshipRes = await friendship.findOneAndDelete(
                    { sender: sender, receiver: receiver, status: 'pending' }
                );
                if (!friendshipRes) {
                    throw new Error('Friend request not found.');
                }
                return friendshipRes;
            } catch (err) {
                throw new Error(err);
            }
        },
        
    }
}