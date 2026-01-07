/**
 * Contact Service
 * Handles all contact-related database operations
 */
const { models, db } = require('../../../../db/sequelize/sequelize');

/**
 * Submit contact form
 */
const submitContactForm = async formData => {
    try {
        const { fullName, email, subject, message } = formData;
        const contactInstance = new db(models.contact_messages);

        const [newMessage, createErr] = await contactInstance.create({
            full_name: fullName,
            email: email,
            subject: subject || 'General Inquiry',
            message: message,
            created_at: new Date()
        });

        if (createErr) {
            return [null, createErr];
        }
        return [newMessage, null];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Get all contact messages (admin)
 */
const getAllMessages = async (page = 1, limit = 10) => {
    try {
        const contactInstance = new db(models.contact_messages);
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const [result, findErr] = await contactInstance.findAndCountAll({
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        if (findErr) {
            return [null, findErr];
        }

        return [
            {
                messages: result?.rows || [],
                pagination: {
                    total: result?.count || 0,
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            },
            null
        ];
    } catch (error) {
        return [null, error];
    }
};

module.exports = {
    submitContactForm,
    getAllMessages
};
