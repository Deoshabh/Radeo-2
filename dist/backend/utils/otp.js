import nodemailer from 'nodemailer';
import otpGenerator from 'otp-generator';
/**
 * Generates a 6-digit OTP.
 * The options specify that we want:
 * - Digits: true (to include numbers)
 * - Uppercase alphabets: false (to exclude uppercase letters)
 * - Lowercase alphabets: false (to exclude lowercase letters)
 * - Special characters: false (to exclude special characters)
 */
export const generateOTP = () => {
    return otpGenerator.generate(6, {
        digits: true, // Include digits (0-9)
        upperCaseAlphabets: false, // Exclude uppercase letters (A-Z)
        lowerCaseAlphabets: false, // Exclude lowercase letters (a-z)
        specialChars: false // Exclude special characters (!@#$%^&*)
    });
};
export const sendOTPEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`,
    };
    await transporter.sendMail(mailOptions);
};
