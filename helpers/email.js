/**
 * Email Service - Baked Bliss
 * Handles all transactional email sending using Nodemailer
 * Following the pattern from docs/NODEMAILER_IMPLEMENTATION_GUIDE.md
 *
 * Required Environment Variables (optional - defaults to Ethereal for testing):
 * - SMTP_HOST: SMTP server host (default: smtp.ethereal.email)
 * - SMTP_PORT: SMTP server port (default: 587)
 * - SMTP_USER: SMTP username
 * - SMTP_PASS: SMTP password
 * - EMAIL_FROM: Default sender address
 * - FRONTEND_URL: Frontend URL for password reset links
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter using SMTP configuration
// Defaults to Ethereal for testing if no SMTP config provided
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || 'jimmie.hettinger12@ethereal.email',
        pass: process.env.SMTP_PASS || '55F5gyEtmmRyGGeCpu'
    }
});

// Verify connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email service failed:', error.message);
    } else {
        const host = process.env.SMTP_HOST || 'smtp.ethereal.email';
        console.log(`✅ Email service ready (${host})`);
        if (host === 'smtp.ethereal.email') {
            console.log('📧 Using Ethereal for testing - view emails at https://ethereal.email/messages');
        }
    }
});

/**
 * Send generic email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} text - Plain text fallback
 */
const sendEmail = async (to, subject, html, text = '') => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'Baked Bliss <noreply@bakedbliss.com>',
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, '') // Strip HTML if no text provided
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${to}: ${info.messageId}`);
        return [info, null];
    } catch (error) {
        console.error(`❌ Email failed to ${to}:`, error.message);
        return [null, error];
    }
};

/**
 * Send OTP verification email
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 */
const sendOTPEmail = async (email, otp) => {
    const subject = 'Your Baked Bliss Verification Code';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f5f0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #8B4513; margin: 0; font-size: 28px;">🧁 Baked Bliss</h1>
                        <p style="color: #a0522d; margin-top: 8px;">Freshly Baked, Delivered Fresh</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="text-align: center;">
                        <h2 style="color: #333; margin-bottom: 10px;">Verification Code</h2>
                        <p style="color: #666; margin-bottom: 30px;">Enter this code to verify your email address:</p>
                        
                        <div style="background: linear-gradient(135deg, #D2691E, #8B4513); border-radius: 12px; padding: 20px; display: inline-block;">
                            <span style="color: white; font-size: 36px; font-weight: bold; letter-spacing: 8px;">${otp}</span>
                        </div>
                        
                        <p style="color: #999; margin-top: 30px; font-size: 14px;">
                            ⏱️ This code expires in <strong>2 minutes</strong>
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        If you didn't request this code, you can safely ignore this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

    const text = `Your Baked Bliss verification code is: ${otp}\n\nThis code expires in 2 minutes.\n\nIf you didn't request this code, please ignore this email.`;

    return sendEmail(email, subject, html, text);
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset token
 */
const sendPasswordResetEmail = async (email, resetToken) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const subject = 'Reset Your Baked Bliss Password';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f5f0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #8B4513; margin: 0; font-size: 28px;">🧁 Baked Bliss</h1>
                    </div>
                    
                    <!-- Content -->
                    <div style="text-align: center;">
                        <h2 style="color: #333; margin-bottom: 10px;">Password Reset Request</h2>
                        <p style="color: #666; margin-bottom: 30px;">
                            We received a request to reset your password.<br>
                            Click the button below to set a new password:
                        </p>
                        
                        <a href="${resetLink}" 
                           style="display: inline-block; 
                                  background: linear-gradient(135deg, #D2691E, #8B4513); 
                                  color: white; 
                                  padding: 16px 40px; 
                                  text-decoration: none; 
                                  border-radius: 8px;
                                  font-weight: bold;
                                  font-size: 16px;">
                            Reset Password
                        </a>
                        
                        <p style="color: #999; margin-top: 30px; font-size: 14px;">
                            ⏱️ This link expires in <strong>1 hour</strong>
                        </p>
                        
                        <p style="color: #ccc; margin-top: 20px; font-size: 12px;">
                            If the button doesn't work, copy this link:<br>
                            <a href="${resetLink}" style="color: #D2691E; word-break: break-all;">${resetLink}</a>
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        If you didn't request this password reset, you can safely ignore this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

    const text = `Reset your Baked Bliss password\n\nWe received a request to reset your password. Click the link below to set a new password:\n\n${resetLink}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.`;

    return sendEmail(email, subject, html, text);
};

/**
 * Send order confirmation email
 * @param {string} email - Recipient email
 * @param {Object} order - Order details
 * @param {string} order.order_id - Order ID
 * @param {Array} order.items - Array of order items
 * @param {number} order.total - Order total
 * @param {Object} order.delivery_address - Delivery address
 */
const sendOrderConfirmationEmail = async (email, order) => {
    const itemsHtml = (order.items || [])
        .map(
            item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                <strong>${item.name}</strong>
                ${item.variant ? `<br><span style="color: #999; font-size: 12px;">${item.variant}</span>` : ''}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `
        )
        .join('');

    const subject = `Order Confirmed: ${order.order_id} 🧁`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f5f0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #8B4513; margin: 0; font-size: 28px;">🧁 Baked Bliss</h1>
                        <div style="background-color: #e8f5e9; color: #2e7d32; padding: 10px 20px; border-radius: 20px; display: inline-block; margin-top: 15px;">
                            ✓ Order Confirmed
                        </div>
                    </div>
                    
                    <!-- Order Info -->
                    <div style="background-color: #f9f5f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                        <p style="margin: 0; color: #666;">
                            <strong>Order ID:</strong> ${order.order_id}<br>
                            <strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    
                    <!-- Order Items -->
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #8B4513; color: white;">
                                <th style="padding: 12px; text-align: left; border-radius: 8px 0 0 0;">Item</th>
                                <th style="padding: 12px; text-align: center;">Qty</th>
                                <th style="padding: 12px; text-align: right; border-radius: 0 8px 0 0;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    
                    <!-- Total -->
                    <div style="text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #8B4513;">
                        <span style="font-size: 24px; color: #8B4513; font-weight: bold;">
                            Total: $${(order.total || 0).toFixed(2)}
                        </span>
                    </div>
                    
                    ${order.delivery_address
            ? `
                    <!-- Delivery Address -->
                    <div style="margin-top: 30px; padding: 20px; background-color: #f9f5f0; border-radius: 8px;">
                        <h3 style="color: #333; margin-top: 0;">📍 Delivery Address</h3>
                        <p style="color: #666; margin: 0;">
                            ${order.delivery_address.street || ''}<br>
                            ${order.delivery_address.city || ''}, ${order.delivery_address.state || ''} ${order.delivery_address.zip || ''}
                        </p>
                    </div>
                    `
            : ''
        }
                    
                    <!-- Footer -->
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #666; font-size: 14px; text-align: center;">
                        Thank you for choosing Baked Bliss! 🎂<br>
                        <span style="color: #999;">Questions? Reply to this email.</span>
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail(email, subject, html);
};

module.exports = {
    transporter,
    sendEmail,
    sendOTPEmail,
    sendPasswordResetEmail,
    sendOrderConfirmationEmail
};
