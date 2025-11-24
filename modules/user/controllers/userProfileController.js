const { db } = require('../../../config/firebaseConfig'); // Import Firestore

// Get user profile function
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.user_id; // Get user ID from request parameters

    // Retrieve user data from Firestore
    const userSnapshot = await db.collection('User').doc(userId).get();
    if (!userSnapshot.exists) {
      return res.status(404).json({ error: "User not found." });
    }

    const userData = userSnapshot.data();

    // Construct response
    const responseData = {
      userId: userData.userId,
      fullName: userData.fullName,
      email: userData.email,
      phoneNo: userData.phoneNumber,
      imageUrl: userData.profilePicture,
    };

    res.status(200).json({ status: "success", data: responseData });
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    res.status(500).json({ error: "An error occurred while retrieving the user profile." });
  }
};

module.exports = { getUserProfile };
