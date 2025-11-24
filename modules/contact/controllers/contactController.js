const { db } = require('../../../config/firebaseConfig'); // Assuming Firestore is used for storage

// Handle "Contact Us" form submission
const submitContactForm = async (req, res) => {
  try {
    const { fullName, email, message } = req.body;

    // Validate input fields
    if (!fullName || !email || !message) {
      return res.status(400).json({ error: "All fields are required: fullName, email, and message." });
    }

    // Optional: Save the message in the database
    await db.collection('ContactMessages').add({
      fullName,
      email,
      message,
      date: new Date().toISOString()
    });

    // Respond to the frontend with a success message
    res.status(200).json({ message: "Your inquiry has been received. We'll get back to you shortly." });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({ error: "Failed to submit your inquiry. Please try again later." });
  }
};

module.exports = { submitContactForm };
