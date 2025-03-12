import admin from '../services/firebaseService';

/**
 * SMS Service for sending verification codes
 * Note: Firebase Phone Authentication primarily happens on the client side.
 * This service is for backend integration and testing purposes.
 * In production, most phone verification is handled by the Firebase client SDK.
 */

export const sendSMS = async (phoneNumber: string, message: string): Promise<boolean> => {
  try {
    console.log(`[Firebase] Would send SMS to ${phoneNumber}: ${message}`);
    
    // Note: Actual SMS sending is handled by Firebase on the client side
    // This function now primarily serves as a placeholder and for logging
    
    // For testing/fallback purposes only:
    if (process.env.SMS_PROVIDER === 'console') {
      console.log(`SMS Content (for testing): ${message}`);
      return true;
    }
    
    // In a real implementation, you might need to use a backup SMS provider
    // if you want server-initiated SMS (which Firebase doesn't directly support)
    
    return true;
  } catch (error) {
    console.error('Error in SMS service:', error);
    return false;
  }
};

// Verify a phone number exists in Firebase Auth
export const verifyPhoneNumberExists = async (phoneNumber: string): Promise<boolean> => {
  try {
    // Attempt to get user by phone number
    const userRecord = await admin.auth().getUserByPhoneNumber(phoneNumber);
    return !!userRecord;
  } catch (error) {
    // User doesn't exist or other error
    return false;
  }
}; 