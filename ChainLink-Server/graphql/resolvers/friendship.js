// friendship.js
const friendship = require('../../models/Friendship');
const users = require('../../models/User');
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
        },

        async getFriendStatuses(_, { currentUsername, usernameList }, context) {
            try {
                // Ensure the current user is not in the usernameList
                usernameList = usernameList.filter(username => username !== currentUsername);
        
                // Query friendships where currentUsername is either the sender or receiver with any username in usernameList
                // create an array of strings
                const test = ['bakermo91', 'agirluser12'];
    
                const friendships = await friendship.find({
                    $or: [
                        { sender: currentUsername, receiver: { $in: usernameList } },
                        { sender: { $in: usernameList } , receiver: currentUsername },
                    ]
    
                });

                friendStatuses = [];
                // for each item in friendships, the otherUser is the sender or receiver that is not the current user.
                // insert friendStatuses[otherUser] = status
                for (let i = 0; i < friendships.length; i++) {
                    if (friendships[i].sender === currentUsername) {
                        friendStatuses[friendships[i].receiver] = friendships[i].status;
                    } else {
                        friendStatuses[friendships[i].sender] = friendships[i].status;
                    }
                }

                const statusArray = [];
                // lop through usernameList, if the username is not in friendStatuses, add it with status 'none'
                for (let i = 0; i < usernameList.length; i++) {
                    if (friendStatuses[usernameList[i]] === undefined) {
                        statusArray.push({ otherUser: usernameList[i], status: 'none' });
                    } else {
                        statusArray.push({ otherUser: usernameList[i], status: friendStatuses[usernameList[i]] });
                    }
                }
        
                return statusArray;
            } catch (err) {
                throw new Error(err);
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
              throw new Error('Request already sent.');
            }

            // Check if the sender and receiver are the same
            if (sender === receiver) {
                throw new Error('Cannot send friend request to yourself.');
            }

            // Check if receiver exists
            const receiverExists = await users.findOne({
                username: receiver,
            });
            if (!receiverExists) {
                throw new Error('Username does not exist.');
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
        async removeFriend(_, { sender, receiver }) {
            try {
                const friendshipRes = await friendship.findOneAndDelete(
                    { $or: [
                        { sender: sender, receiver: receiver, status: 'accepted' },
                        { sender: receiver, receiver: sender, status: 'accepted' }
                    ]}
                );
                if (!friendshipRes) {
                    throw new Error('Friendship not found.');
                }
        
                return friendshipRes;
            } catch (err) {
                throw new Error(err);
            }
        }
    }
}