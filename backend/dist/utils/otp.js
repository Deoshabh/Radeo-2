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
exports.sendOTPEmail = exports.generateOTP = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const otp_generator_1 = __importDefault(require("otp-generator"));
/**
 * Generates a 6-digit OTP.
 * The options specify that we want:
 * - Digits: true (to include numbers)
 * - Uppercase alphabets: false (to exclude uppercase letters)
 * - Lowercase alphabets: false (to exclude lowercase letters)
 * - Special characters: false (to exclude special characters)
 */
const generateOTP = () => {
    return otp_generator_1.default.generate(6, {
        digits: true, // Include digits (0-9)
        upperCaseAlphabets: false, // Exclude uppercase letters (A-Z)
        lowerCaseAlphabets: false, // Exclude lowercase letters (a-z)
        specialChars: false // Exclude special characters (!@#$%^&*)
    });
};
exports.generateOTP = generateOTP;
const sendOTPEmail = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
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
    yield transporter.sendMail(mailOptions);
});
exports.sendOTPEmail = sendOTPEmail;
