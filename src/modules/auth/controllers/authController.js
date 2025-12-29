const { models } = require('../../../../config/sequelizeConfig');
const { User } = models;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

// Helper functions to avoid duplication
const createUser = async (userData) => {
  return await User.create(userData);
};

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
};

const verifyPassword = (password, hash, salt) => {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
};

// Sign-up function
const signUpUser = async (req, res) => {
  try {
    const { fullName, email, password, profilePicture, addresses, selectedAddressId, phoneNumber, role } = req.body;

    if (!fullName) {
      return res.status(400).json({ message: "Invalid input: fullName is required." });
    }

    if (!password) {
      return res.status(400).json({ message: "Invalid input: password is required." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    const timestamp = Date.now().toString();
    const randomPart = Math.random().toString(36).substring(2, 8);
    const userId = `user_${timestamp}_${randomPart}`;

    const { salt, hash } = hashPassword(password);

    const newUserData = {
      user_id: userId,
      full_name: fullName,
      role: role || 'user',
      email: email || null,
      password: hash,
      salt: salt,
      profile_picture: profilePicture || null,
      addresses: addresses || [],
      phone_number: phoneNumber || null,
      date_joined: new Date(),
      selected_address_id: selectedAddressId || null
    };

    const newUser = await createUser(newUserData);

    const token = jwt.sign(
      { uid: newUser.user_id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Convert to response format
    const responseData = {
      userId: newUser.user_id,
      fullName: newUser.full_name,
      role: newUser.role,
      email: newUser.email,
      profilePicture: newUser.profile_picture,
      addresses: newUser.addresses,
      phoneNumber: newUser.phone_number,
      dateJoined: newUser.date_joined,
      selectedAddressId: newUser.selected_address_id
    };

    res.status(201).json({ message: "success", data: responseData, token });

  } catch (error) {
    console.error("Error signing up user:", error);
    res.status(500).json({ message: "failed", error: "An error occurred during signup." });
  }
};


// Sign-in function
const signInUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'failed',
        error: "Email and password are required."
      });
    }

    // Find user by email
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({
        message: 'failed',
        error: "User does not exist."
      });
    }

    // Verify password
    if (!user.password || !user.salt) {
      // Handle legacy users or social login users who might not have a password
      return res.status(400).json({
        message: 'failed',
        error: "Invalid credentials or social login account."
      });
    }

    const isValid = verifyPassword(password, user.password, user.salt);

    if (!isValid) {
      return res.status(401).json({
        message: 'failed',
        error: "Invalid password."
      });
    }

    const token = jwt.sign(
      { uid: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Convert to response format
    const responseData = {
      userId: user.user_id,
      fullName: user.full_name,
      role: user.role,
      email: user.email,
      profilePicture: user.profile_picture,
      addresses: user.addresses,
      phoneNumber: user.phone_number,
      dateJoined: user.date_joined,
      selectedAddressId: user.selected_address_id
    };

    return res.status(200).json({
      message: "success",
      data: responseData,
      token
    });

  } catch (error) {
    console.error("Error signing in user:", error);
    res.status(500).json({
      message: "failed",
      error: "An error occurred during sign-in."
    });
  }
};

// Social login function
const socialLogin = async (req, res) => {
  try {
    const { userId, fullName, email, profilePicture, addresses, selectedAddressId, phoneNumber, pushToken } = req.body;

    // Input validation
    if (!userId || !fullName) {
      return res.status(400).json({ message: "Invalid input: userId and fullName are required." });
    }

    // Check if the user exists
    const existingUser = await User.findOne({
      where: { user_id: userId }
    });

    if (existingUser) {
      // Update pushToken if provided
      if (pushToken && pushToken.trim() !== "") {
        await existingUser.update({ push_token: pushToken });
      }

      // Always return the updated data
      const updatedUserData = {
        userId: existingUser.user_id,
        fullName: existingUser.full_name,
        role: existingUser.role,
        email: existingUser.email,
        profilePicture: existingUser.profile_picture,
        addresses: existingUser.addresses,
        phoneNumber: existingUser.phone_number,
        dateJoined: existingUser.date_joined,
        pushToken: pushToken || existingUser.push_token || null,
        selectedAddressId: selectedAddressId || existingUser.selected_address_id || null
      };

      // Issue JWT on social login (existing user)
      const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
      const token = jwt.sign({ uid: updatedUserData.userId, email: updatedUserData.email }, secret, { expiresIn: '1h' });
      return res.status(200).json({ message: "success", data: updatedUserData, token });
    }

    // Create new user if not found
    const newUserData = {
      user_id: userId,
      full_name: fullName,
      email: email || null,
      profile_picture: profilePicture || null,
      addresses: addresses || [],
      phone_number: phoneNumber || null,
      date_joined: new Date(),
      push_token: pushToken || null,
      selected_address_id: selectedAddressId || null,
    };

    const newUser = await createUser(newUserData);

    const responseData = {
      userId: newUser.user_id,
      fullName: newUser.full_name,
      role: newUser.role,
      email: newUser.email,
      profilePicture: newUser.profile_picture,
      addresses: newUser.addresses,
      phoneNumber: newUser.phone_number,
      dateJoined: newUser.date_joined,
      pushToken: newUser.push_token,
      selectedAddressId: newUser.selected_address_id
    };

    const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
    const token = jwt.sign({ uid: responseData.userId, email: responseData.email }, secret, { expiresIn: '1h' });
    return res.status(201).json({ message: "success", data: responseData, token });

  } catch (error) {
    console.error("Error during social login:", error);
    return res.status(500).json({ message: "failed", error: "An error occurred during social login." });
  }
};


module.exports = { signUpUser, signInUser, socialLogin };
