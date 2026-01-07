/**
 * Contact Controller
 * Handles HTTP requests/responses, delegates business logic to ContactService
 */
const ContactService = require('../services/contactService');

// Handle "Contact Us" form submission
const submitContactForm = async (req, res) => {
    try {
        const { fullName, email, subject, message } = req.body;

        if (!fullName || !email || !message) {
            return res.status(400).json({
                status: 'error',
                message: 'All fields are required: fullName, email, and message.'
            });
        }

        const [_result, error] = await ContactService.submitContactForm({
            fullName,
            email,
            subject,
            message
        });

        if (error) {
            console.error('Error submitting contact form:', error);
            return res.status(error.status || 500).json({
                status: 'error',
                message: 'Failed to submit your inquiry. Please try again later.'
            });
        }

        res.status(200).json({
            status: 'success',
            message: "Your inquiry has been received. We'll get back to you shortly."
        });
    } catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to submit your inquiry. Please try again later.'
        });
    }
};

// Get all contact messages (admin)
const getAllMessages = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const [result, error] = await ContactService.getAllMessages(page, limit);

        if (error) {
            console.error('Error getting contact messages:', error);
            return res.status(error.status || 500).json({
                status: 'error',
                message: 'Failed to get messages'
            });
        }

        res.status(200).json({
            status: 'success',
            data: result.messages,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Error getting contact messages:', error);
        res.status(500).json({ status: 'error', message: 'Failed to get messages' });
    }
};

module.exports = { submitContactForm, getAllMessages };
