"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.sendOTPEmail = exports.isEmailServiceAvailable = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
// SendGrid configuration flag
let sendgridConfigured = false;
// For SendGrid integration - validate API key format
if (process.env.SENDGRID_API_KEY) {
    // Trim the API key to remove any accidental whitespace
    const apiKey = process.env.SENDGRID_API_KEY.trim();
    // Check if the API key starts with 'SG.'
    if (!apiKey.startsWith('SG.')) {
        console.error('ERROR: Invalid SendGrid API key format. The key must start with "SG."');
        console.error('Email sending via SendGrid will not be available.');
    }
    else {
        try {
            mail_1.default.setApiKey(apiKey);
            sendgridConfigured = true;
            console.log('SendGrid API key configured successfully');
        }
        catch (error) {
            console.error('ERROR: Failed to set SendGrid API key:', error);
        }
    }
}
else {
    console.log('No SendGrid API key found in environment variables. Will use SMTP fallback if configured.');
}
// Create reusable transporter - fallback to SMTP if SendGrid is not configured
let smtpConfigured = false;
let transporter;
try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
        smtpConfigured = true;
        console.log('SMTP transport configured successfully');
    }
    else {
        console.log('SMTP configuration is incomplete. Email fallback will not be available.');
        // Create a placeholder transporter for TypeScript
        transporter = nodemailer_1.default.createTransport({});
    }
}
catch (error) {
    console.error('Error configuring SMTP transport:', error);
    // Create a placeholder transporter for TypeScript
    transporter = nodemailer_1.default.createTransport({});
}
/**
 * Check if any email service is available
 * @returns boolean indicating if at least one email service is available
 */
const isEmailServiceAvailable = () => {
    return sendgridConfigured || smtpConfigured;
};
exports.isEmailServiceAvailable = isEmailServiceAvailable;
/**
 * Send OTP email using available email service
 * @param email The recipient email address
 * @param otp The OTP code to send
 */
const sendOTPEmail = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!(0, exports.isEmailServiceAvailable)()) {
            console.error('No email service is properly configured. Cannot send OTP email.');
            return;
        }
        // Email content
        const mailOptions = {
            from: process.env.EMAIL_FROM || `"Radeo Support" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your OTP Verification Code",
            text: `Your OTP verification code is: ${otp}. It will expire in 10 minutes.`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>OTP Verification Code</h2>
          <p>Your one-time password is:</p>
          <h1 style="font-size: 36px; letter-spacing: 5px; background-color: #f4f4f4; padding: 10px; text-align: center;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this code, please ignore this email.</p>
        </div>
      `,
        };
        // If SendGrid is properly configured, use it; otherwise fall back to nodemailer
        if (sendgridConfigured) {
            yield mail_1.default.send({
                to: email,
                from: process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@yourdomain.com',
                subject: mailOptions.subject,
                text: mailOptions.text,
                html: mailOptions.html,
            });
            console.log(`OTP sent to ${email} via SendGrid`);
        }
        else if (smtpConfigured) {
            // Fall back to standard nodemailer
            yield transporter.sendMail(mailOptions);
            console.log(`OTP sent to ${email} via SMTP`);
        }
        else {
            console.error('No email service available. Failed to send OTP email.');
        }
    }
    catch (error) {
        console.error(`Error sending OTP email: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Don't throw error - log and continue to avoid crashes
        console.log('Email delivery failed, but application will continue');
    }
});
exports.sendOTPEmail = sendOTPEmail;
/**
 * General email sending function with priority for SendGrid and fallback to SMTP
 * @returns boolean indicating success or failure
 */
const sendEmail = (to, subject, text, html) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!(0, exports.isEmailServiceAvailable)()) {
            console.error('No email service is properly configured. Cannot send email.');
            return false;
        }
        // Check for valid SendGrid configuration first
        if (sendgridConfigured) {
            yield mail_1.default.send({
                to,
                from: process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@yourdomain.com',
                subject,
                text,
                html: html || text,
            });
            return true;
        }
        else if (smtpConfigured) {
            yield transporter.sendMail({
                from: process.env.EMAIL_FROM || `"Radeo Support" <${process.env.SMTP_USER}>`,
                to,
                subject,
                text,
                html: html || text,
            });
            return true;
        }
        else {
            return false;
        }
    }
    catch (error) {
        console.error(`Error sending email: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return false;
    }
});
exports.sendEmail = sendEmail;
exports.default = transporter;
