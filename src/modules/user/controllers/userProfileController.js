const { models } = require('../../../../config/sequelizeConfig');
const { User } = models;

// Get user profile function
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.user_id; // Get user ID from request parameters

    // Retrieve user data from database
    const user = await User.findOne({
      where: { user_id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Construct response
    const responseData = {
      userId: user.user_id,
      fullName: user.full_name,
      email: user.email,
      phoneNo: user.phone_number,
      imageUrl: user.profile_picture,
    };

    res.status(200).json({ status: "success", data: responseData });
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    res.status(500).json({ error: "An error occurred while retrieving the user profile." });
  }
};

module.exports = { getUserProfile };
