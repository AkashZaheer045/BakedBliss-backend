const { models } = require('../../../../config/sequelizeConfig');
const { ContactMessage } = models;

// Handle "Contact Us" form submission
const submitContactForm = async (req, res) => {
  try {
    const { fullName, email, message } = req.body;

    // Validate input fields
    if (!fullName || !email || !message) {
      return res.status(400).json({ error: "All fields are required: fullName, email, and message." });
    }

    // Save the message in the database
    await ContactMessage.create({
      full_name: fullName,
      email: email,
      message: message,
      date: new Date()
    });

    // Respond to the frontend with a success message
    res.status(200).json({ message: "Your inquiry has been received. We'll get back to you shortly." });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({ error: "Failed to submit your inquiry. Please try again later." });
  }
};

module.exports = { submitContactForm };
