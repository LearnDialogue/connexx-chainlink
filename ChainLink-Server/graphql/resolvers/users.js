const GraphQLError = require('graphql').GraphQLError;
const Event = require('../../models/Event.js');
const Route = require('../../models/Route.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../../util/email');
const crypto = require('crypto');
const mongoose = require('mongoose');

const {
  handleInputError,
  handleGeneralError,
} = require('../../util/error-handling');

const {
  validateRegisterInput,
  validateLoginInput,
  validateUsername,
  validateEmail,
  validateEditProfileInput,
} = require('../../util/validators');

const { fetchLocation } = require('../../util/geocoder.js');

const User = require('../../models/User.js');
const Club = require('../../models/Club.js');

require('dotenv').config();

function generateToken(user, time) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      permission: user.permission,
    },
    process.env.SECRET,
    {
      expiresIn: time,
    }
  );
}

/*
This function checks if a user's strava token has expired.
If the token has expired, a new token will be requested from strava
and the respective fields in the user document will be updated.
Returns the strava expiration date.
*/
async function checkStravaToken(username) {
  //check for token expiry
  try {
    const user = await User.findOne({ username }).select(
      'stravaRefreshToken stravaTokenExpiration'
    );
    if (user.stravaTokenExpiration < new Date()) {
      //token has expired, request new one
      return refreshStravaToken(username, user.stravaRefreshToken);
    }
  } catch (error) {
    handleGeneralError(error, 'User not found.');
  }
}

async function stravaGetAthlete(APIToken) {
  try {
    const response = await fetch('https://www.strava.com/api/v3/athlete', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${APIToken}`,
        'Content-Type': 'application/json',
      },
    });

    const athleteData = await response.json();
    return athleteData;
  } catch (error) {
    throw new Error('Failed to fetch athlete from Strava API');
  }
}

async function refreshStravaToken(username, refreshToken) {
  try {
    const queryParams = new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const response = await fetch(
      `https://www.strava.com/oauth/token?${queryParams}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: 'value' }),
      }
    );

    const responseData = await response.json();
    const APIToken = responseData.access_token;
    const refreshToken = responseData.refresh_token;
    const tokenExpiration = new Date(responseData.expires_at).toISOString();
    const user = await User.findOneAndUpdate(
      { username: username },
      {
        stravaAPIToken: APIToken,
        stravaRefreshToken: refreshToken,
        stravaTokenExpiration: tokenExpiration,
      }
    );
    return tokenExpiration;
  } catch (error) {
    throw new GraphQLError(err, {
      extensions: {
        code: 'Internal Server Error',
      },
    });
  }
  return null;
}
module.exports = {
  Query: {
    async getUsers(_, __) {
      try {
        const users = await User.find();

        if (!users) {
          throw new Error(`No users found.`)
        }

        return users
      } catch (error) {
        console.error("Error retrieving users:", error);
        handleGeneralError(error, 'Users not found.');
        throw new Error('Failed to retrieve users.');
      }
    },

    async getUser(_, { username }) {
      try {
        const userIdentifier = { username: username.toLowerCase() };
        const user = await User.findOne(userIdentifier);
        if (!user) {
          throw new Error(`User with username not found.`);
        }

        return user;
      } catch (error) {
        console.error("Error retrieving user by username:", error);
        handleGeneralError(error, 'User not found.');
        throw new Error('Failed to retrieve user.');
      }
    },

    async getUserByID(_, { userID }) {
      try {
        // Validate and convert userID with Mongoose
        if (!mongoose.Types.ObjectId.isValid(userID)) {
          throw new Error("Invalid ID format provided.");
        }
        const userIdentifier = { _id: new mongoose.Types.ObjectId(userID) };
    
        const user = await User.findOne(userIdentifier);
        if (!user) {
          throw new Error(`User with ID not found.`);
        }
        return user;
      } catch (error) {
        console.error("Error retrieving user by ID:", error);
        handleGeneralError(error, 'User not found.');
        throw new Error('Failed to retrieve user.');
      }
    },

    async validUsername(_, { username }) {
      const user = await User.findOne({ username: username.toLowerCase() });
      if (user) return false;

      const { valid, errors } = validateUsername(username);
      if (!valid) {
        handleInputError(errors);
      }
      return true;
    },

    async validEmail(_, { email }) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) return false;

      const { valid, errors } = validateEmail(email);
      if (!valid) {
        handleInputError(errors);
      }
      return true;
    },
    async requestStravaAuthorization(_, __) {
      //construct oauth url
      const queryParams = new URLSearchParams({
        client_id: process.env.STRAVA_CLIENT_ID,
        redirect_uri: process.env.CLIENT_URI + 'redirect',
        scope: 'activity:read_all,profile:read_all',
        response_type: 'code',
        approval_prompt: 'auto',
      });

      return `https://www.strava.com/oauth/authorize?${queryParams}`;
    },
    async getPublicUsers(_, __) {
      try {
        const users = await User.find({ isPrivate: false });

        if (!users) {
          throw new Error(`No public users found.`)
        }

        return users
      } catch (error) {
        console.error("Error retrieving public users:", error);
        handleGeneralError(error, 'Public users not found.');
        throw new Error('Failed to retrieve public users.');
      }
    },
  },

  Mutation: {
    async register(
      _,
      {
        registerInput: {
          username,
          email,
          password,
          confirmPassword,
          firstName,
          lastName,
          sex,
          birthday,
          weight,
          experience,
          FTP,
          metric,
          isPrivate,
          bikeTypes,
        },
      }
    ) {
      firstName = firstName.trim();
      lastName = lastName.trim();
      email = email.toLowerCase();
      username = username.toLowerCase();

      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword,
        firstName,
        lastName,
        sex,
        birthday,
        weight,
        experience,
        FTP,
        metric,
        isPrivate,
        bikeTypes
      );

      if (!valid) {
        handleInputError(errors);
      }

      const usernameCheck = await User.findOne({ username });
      if (usernameCheck) {
        errors.general = 'An account with that username already exists.';
        handleInputError(errors);
      }

      const emailCheck = await User.findOne({ email });
      if (emailCheck) {
        errors.general = 'An account with that e-mail already exists.';
        handleInputError(errors);
      }

      FTP = FTP === 0 ? 2 * weight : FTP;

      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        username: username,
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        sex: sex,
        birthday: birthday,
        weight: weight,
        experience: experience,
        bikeTypes: bikeTypes,
        FTP: FTP,
        isPrivate,
        FTPdate: new Date().toISOString(),
        metric: metric,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        permission: 'member',
        gear: [],
        eventsHosted: [],
        eventsJoined: [],
        locationName: 'Gainesville, FL',
        locationCoords: [-82.355659, 29.643946],
        radius: 30,
      });
      const res = await newUser.save();

      const loginToken = generateToken(newUser, '24h');

      return {
        ...res._doc,
        id: res._id,
        loginToken,
      };
    },

    async requestPasswordReset(_, { userNameOrEmail }) {
      const user = await User.findOne({
        $or: [{ email: userNameOrEmail.toLowerCase() }, { username: userNameOrEmail.toLowerCase() }]
      });
  
      if (!user) {
        throw new Error('User not found.');
      }
  
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
      await user.save();
  
      // Send email using Nodemailer
      await sendPasswordResetEmail(user, resetToken);
  
      return { success: true, message: 'Password reset email sent.' };
    },

    async resetPassword(_, { resetToken, newPassword }) {
      try {
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
        // Find the user by the reset token and check if it hasn't expired
        const user = await User.findOne({
          resetPasswordToken: hashedToken,
          resetPasswordExpires: { $gt: Date.now() }
        });
    
        if (!user) {
          throw new GraphQLError('Reset token is invalid or has expired', {
            extensions: { code: 'INVALID_TOKEN' }
          });
        }
    
        // Hash the new password
        user.password = await bcrypt.hash(newPassword, 12);
    
        // Clear the reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
    
        // We also need to reset the login attempts and 
        // lockout fields in case they were locked out
        // when they were reseetting their password
        user.loginAttempts = 0;
        user.loginLockout = undefined;
        await user.save();
    
        return { success: true, message: 'Password has been reset.' };
    
      } catch (err) {
        throw new GraphQLError(err.message, { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },

    async login(_, { loginInput: { username, password, remember } }) {
      username = username.toLowerCase();
      const { errors, valid } = validateLoginInput(username, password);

      if (!valid) {
        handleInputError(errors);
      }

      const user = await User.findOne({ username });
      if (!user) {
        errors.general = 'User not found.';
        handleInputError(errors);
      }

      const lockoutError = 'Your account has been temporarily locked due to too many failed login attempts. Please try again later or reset your password';
      if (user.loginLockout && new Date(user.loginLockout) > Date.now()) { 
        errors.general = lockoutError;
        handleInputError(errors);
      }

      const passwordCheck = await bcrypt.compare(password, user.password);
      if (!passwordCheck) {
        errors.general = 'Wrong credentials.';

        user.loginAttempts += 1;
        if (user.loginAttempts >= 3) {
          // set login lockout to the current time plus 30 mins
          user.loginLockout = new Date(Date.now() + 30 * 60000).toISOString();

          // then reset the login attempts, because when they try again after the lockout expires
          // they will get 3 more tries
          user.loginAttempts = 0;
          errors.general = lockoutError;
        }

        await User.updateOne(
          { username: user.username },
          { loginAttempts: user.loginAttempts, loginLockout: user.loginLockout }
        );

        handleInputError(errors);
      }

      time = remember === 'true' || remember === true ? '30d' : '24h';
      const loginToken = generateToken(user, time);

      // If we get here, the user has successfully logged in,
      // so reset any login attempts and lockout
      user.loginAttempts = 0;
      user.loginLockout = undefined;

      await User.updateOne(
        { username: user.username },
        { loginAttempts: user.loginAttempts, loginLockout: user.loginLockout }
      );

    
      return {
        ...user._doc,
        id: user._id,
        loginToken,
      };
    },

    async editProfile(
      _,
      {
        editProfileInput: {
          username,
          email,
          firstName,
          lastName,
          sex,
          birthday,
          weight,
          experience,
          FTP,
          location,
          radius,
          metric,
          isPrivate,
          bikeTypes,
        },
      },
      contextValue
    ) {
      const { errors, valid } = validateEditProfileInput(
        username,
        email,
        firstName,
        lastName,
        sex,
        birthday,
        weight,
        experience,
        FTP,
        location,
        radius,
        metric,
        isPrivate,
        bikeTypes
      );

      if (!valid) {
        handleInputError(errors);
      }

      const user = await User.findOne({ _id: contextValue.user.id });
      if (!user) handleGeneralError({}, 'User not found.');

      const usernameCheck = await User.findOne({ username });
      if (
        usernameCheck &&
        usernameCheck.username !== contextValue.user.username
      ) {
        errors.general = 'An account with that username already exists.';
        handleInputError(errors);
      }

      const emailCheck = await User.findOne({ email });
      if (emailCheck && emailCheck.email !== contextValue.user.email) {
        errors.general = 'An account with that e-mail already exists.';
        handleInputError(errors);
      }

      const fetchedData = await fetchLocation(location, null);
      locationCoords = [fetchedData.lon, fetchedData.lat];

      FTP = FTP === 0 ? 2 * weight : FTP;
      const newFTPdate =
        FTP === user.FTP ? user.FTPdate : new Date().toISOString();

      const updatedUser = await User.findOneAndUpdate(
        { _id: contextValue.user.id },
        {
          username: username,
          email: email,
          firstName: firstName,
          lastName: lastName,
          sex: sex,
          birthday: birthday,
          weight: weight,
          experience: experience,
          FTP: FTP,
          FTPdate: newFTPdate,
          locationName: location,
          locationCoords: locationCoords,
          radius: radius,
          metric: metric,
          isPrivate: isPrivate,
          bikeTypes: bikeTypes,
        },
        {
          new: true,
        }
      );

      // If any of these values are changed, the user will need
      // a new token, as these are properties of the login token

      var loginToken;
      if (
        user.username !== username ||
        user.email !== email ||
        user.firstName !== firstName ||
        user.lastName !== lastName
      ) {
        loginToken = generateToken(updatedUser, '24h');
      }

      return {
        ...updatedUser._doc,
        id: updatedUser._id,
        loginToken,
      };
    },

    async deleteUser(_, {}, contextValue) {
      const user = await User.findOne({ _id: contextValue.user.id });
      if (!user) {
        throw new GraphQLError('User not found.', {
          extensions: {
            code: 'USER_NOT_FOUND',
          },
        });
      }

      // Leave all joined events
      for (const eventID of Object.values(user.eventsJoined)) {
        const fetchedEvent = await Event.findOneAndUpdate(
          { _id: eventID },
          { $pull: { participants: user.username } }
        );
      }

      // Delete all hosted events
      for (const eventID of Object.values(user.eventsHosted)) {
        const fetchedEvent = await Event.findOne({ _id: eventID });
        const participants = fetchedEvent.participants;
        for (const participant of participants) {
          await User.findOneAndUpdate(
            { username: participant },
            { $pull: { eventsJoined: eventID } }
          );
        }
        const delEvent = await Event.findOneAndDelete({ _id: eventID });
        const delRoute = await Route.deleteOne({ _id: delEvent.route });
      }

      // Delete user record
      await User.deleteOne({ _id: user._id });

      return user;
    },

    async updateProfileImage(_, { updateProfileImageInput: { username, hasProfileImage }}) {
      const user = await User.findOneAndUpdate(
        { username },
        { hasProfileImage },
        { new: true } // Ensure the updated document is returned      
      );

      if (!user) {
        throw new GraphQLError('User not found.', {
          extensions: {
            code: 'USER_NOT_FOUND',
          },
        });
      }
      return user;
    },

    /*
        Front-end should cache all unique calls to this function. If calling for the first time, 
        include just these arguments: USERNAME, LOCATIONNAME. If calling on a cached query, 
        include these arguments, which should be pulled from the storage on the front end. 
        Arguments: USERNAME, LOCATIONCOORDS, LOCATIONNAME. If you want to change radius, it can
        be included in any combination of the function call, even just by itself. Don't forget
        to include the username for all function calls.
         */
    async setRegion(
      _,
      { setRegionInput: { username, locationCoords, locationName, radius } }
    ) {
      var name;
      var coords;

      if (locationCoords) {
        name = locationName;
        coords = locationCoords;
      } else {
        const fetchedData = await fetchLocation(locationName, null);
        name = fetchedData.display_name;
        coords = [fetchedData.lon, fetchedData.lat];
      }

      const updatedUser = await User.findOneAndUpdate(
        { username },
        {
          locationName: name,
          locationCoords: coords,
          radius: radius,
        },
        { returnDocument: 'after' }
      );
      return updatedUser;
    },

    async addGear(
      _,
      {
        addGearInput: {
          username,
          type,
          subtype,
          make,
          model,
          weight,
          distance,
        },
      }
    ) {
      const newGear = {
        type,
        subtype,
        make,
        model,
        weight,
        distance,
      };
      const res = await User.findOneAndUpdate(
        { username },
        { $push: { equipment: newGear } },
        { returnDocument: 'after' }
      );
      return res.equipment;
    },

    async removeGear(_, { username, gearID }) {
      const res = await User.findOneAndUpdate(
        { username },
        { $pull: { equipment: { _id: gearID } } },
        { returnDocument: 'after' }
      );
      return res.equipment;
    },

    async exchangeStravaAuthorizationCode(_, { code, scope }, contextValue) {
      const scopeArray = scope.split(',');
      if (
        !scopeArray.includes('activity:read_all') ||
        !scopeArray.includes('profile:read_all')
      ) {
        throw new GraphQLError('Scope does not include correct permissions.', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        });
      }
      //exchange tokens with Strava
      const queryParams = new URLSearchParams({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
      });

      try {
        const response = await fetch(
          `https://www.strava.com/oauth/token?${queryParams}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ key: 'value' }),
          }
        );

        const responseData = await response.json();
        const APIToken = responseData.access_token;
        const refreshToken = responseData.refresh_token;
        const tokenExpiration = new Date(
          responseData.expires_at * 1000
        ).toISOString();

        //store user's access
        const user = await User.findOneAndUpdate(
          { username: contextValue.user.username },
          {
            stravaAPIToken: APIToken,
            stravaRefreshToken: refreshToken,
            stravaTokenExpiration: tokenExpiration,
          }
        );
        return user;
      } catch (err) {
        throw new GraphQLError(err, {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
          },
        });        
      }
    },
    

    // New mutations for clubs
    async createClub(_, { clubInput }) {
      const newClub = new Club(clubInput);
      await newClub.save();
      return newClub;
    },

    async updateClub(_, { id, clubInput }) {
      return await Club.findByIdAndUpdate(id, clubInput, { new: true });
    },

    async deleteClub(_, { id }) {
      await Club.findByIdAndDelete(id);
      return "Club deleted";
    },
  },
  User: {
    async clubsOwned(user) {
      return await Club.find({ _id: { $in: user.clubsOwned } });
    },
    async clubsJoined(user) {
      return await Club.find({ _id: { $in: user.clubsJoined } });
    },
    birthday: (user) => {
    if (!user.birthday) return null;
    const [year, month, day] = user.birthday.split('-').map(Number);
    // Create Date in current timezone at midnight, to prevent timezone shifts
    const timeZoneDate = new Date(year, month - 1, day);
    return timeZoneDate
  },
  },  
};
