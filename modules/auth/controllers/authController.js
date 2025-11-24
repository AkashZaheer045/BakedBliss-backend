const { db } = require('../../../config/firebaseConfig');

// Helper functions to avoid duplication
const createUser = async (userData) => {
  await db.collection('User').doc(userData.userId).set(userData);
};

const updateUserPushToken = async (userId, pushToken) => {
  await db.collection('User').doc(userId).update({ pushToken });
};

// Sign-up function
const signUpUser = async (req, res) => {
  try {
    const { userId, fullName, email, profilePicture, addresses, selectedAddressId, phoneNumber, pushToken } = req.body;

    // Input validation (add more as necessary)
    if (!userId || !fullName) {
      return res.status(400).json({ message: "Invalid input: userId and fullName are required." });
    }

    const userSnapshot = await db.collection('User').doc(userId).get();
    if (userSnapshot.exists) {
      if (pushToken) {
        await updateUserPushToken(userId, pushToken);
      }
      return res.status(409).json({ message: "failed", error: "User already exists." });
    }

    const newUser = {
      userId, fullName, email: email || null, profilePicture: profilePicture || null,
      addresses: addresses || [], phoneNumber: phoneNumber || null,
      dateJoined: new Date().toISOString(), pushToken: pushToken || null,
      selectedAddressId: selectedAddressId || null,
    };

    await createUser(newUser);
    res.status(201).json({ message: "success", data: newUser });
  } catch (error) {
    console.error("Error signing up user:", error);
    res.status(500).json({ message: "failed", error: "An error occurred during signup." });
  }
};

// Sign-in function
  const signInUser = async (req, res) => {
    try {
      const { userId, email, pushToken } = req.body;
  
      // Fetch user data from Firestore
      const userSnapshot = await db.collection('User').doc(userId).get();
      if (!userSnapshot.exists) {
        return res.status(400).json({
          message: 'failed',
          error: "User does not exist."
        });
      }
  
      const userData = userSnapshot.data();
      if (pushToken) {
        await db.collection('User').doc(userId).update({
          pushToken: pushToken
        });
      }
  
      const updatedUser = {
        userId: userData.userId,
        fullName: userData.fullName,
        email: userData.email,
        profilePicture: userData.profilePicture || null,
        addresses: userData.addresses || [],
        phoneNumber: userData.phoneNumber || null,
        dateJoined: userData.dateJoined,
        pushToken: pushToken || null,
        selectedAddressId: userData.selectedAddressId || null, // Add selectedAddressId here
      };
  
      res.status(200).json({ message: "success", data: updatedUser });
    } catch (error) {
      console.error("Error signing in user:", error);
      res.status(500).json({ message: "failed", error: "An error occurred during sign-in." });
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
    const userSnapshot = await db.collection('User').doc(userId).get();
    
    if (userSnapshot.exists) {
      const userData = userSnapshot.data();

      // Update pushToken if provided
      if (pushToken && pushToken.trim() !== "") {
        await updateUserPushToken(userId, pushToken);
      }

      // Always return the updated pushToken (new one if provided, old one otherwise)
      const updatedUser = {
        ...userData,
        pushToken: pushToken || userData.pushToken || null, // Prefer new pushToken if available
        selectedAddressId: selectedAddressId || userData.selectedAddressId || null, // Handle selectedAddressId
      };

      return res.status(200).json({ message: "success", data: updatedUser });
    }

    // Create new user if not found
    const newUser = {
      userId,
      fullName,
      email: email || null,
      profilePicture: profilePicture || null,
      addresses: addresses || [],
      phoneNumber: phoneNumber || null,
      dateJoined: new Date().toISOString(),
      pushToken: pushToken || null,
      selectedAddressId: selectedAddressId || null,
    };

    await createUser(newUser);
    return res.status(201).json({ message: "success", data: newUser });

  } catch (error) {
    console.error("Error during social login:", error);
    return res.status(500).json({ message: "failed", error: "An error occurred during social login." });
  }
};


module.exports = { signUpUser, signInUser, socialLogin };
