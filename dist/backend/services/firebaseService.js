import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
/**
 * Firebase Service for Phone Authentication
 * This module handles Firebase Admin SDK initialization with multiple fallback options:
 * 1. From FIREBASE_SERVICE_ACCOUNT environment variable (JSON string)
 * 2. From individual environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
 * 3. From a local JSON file at config/firebase-service-account.json
 * 4. Using application default credentials as a last resort
 */
// Flag to track if Firebase was successfully initialized
let firebaseInitialized = false;
/**
 * Validates a Firebase service account object has all required fields
 * @param serviceAccount The service account object to validate
 * @returns Boolean indicating if the service account is valid
 */
const validateServiceAccount = (serviceAccount) => {
    // Check for required fields
    if (!serviceAccount || typeof serviceAccount !== 'object') {
        console.error('Service account is not a valid object');
        return false;
    }
    if (!serviceAccount.project_id) {
        console.error('Service account missing required field: project_id');
        return false;
    }
    if (!serviceAccount.client_email) {
        console.error('Service account missing required field: client_email');
        return false;
    }
    if (!serviceAccount.private_key) {
        console.error('Service account missing required field: private_key');
        return false;
    }
    // Ensure private_key is a string and contains the expected format
    if (typeof serviceAccount.private_key !== 'string' ||
        !serviceAccount.private_key.includes('-----BEGIN PRIVATE KEY-----')) {
        console.error('Service account contains an invalid private_key format');
        return false;
    }
    return true;
};
// Only attempt initialization if no Firebase app is already running
if (!admin.apps.length) {
    console.log('Initializing Firebase Admin SDK...');
    try {
        // STRATEGY 1: Initialize from FIREBASE_SERVICE_ACCOUNT environment variable
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            try {
                console.log('Attempting to initialize Firebase using FIREBASE_SERVICE_ACCOUNT environment variable...');
                // Parse the JSON string, trimming any whitespace
                const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT.trim());
                // Validate the service account object
                if (validateServiceAccount(serviceAccount)) {
                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount)
                    });
                    firebaseInitialized = true;
                    console.log('✅ Firebase Admin SDK initialized successfully using service account from environment variable.');
                }
                else {
                    throw new Error('Service account validation failed');
                }
            }
            catch (parseError) {
                console.error('❌ Firebase service account JSON parsing error:', parseError);
                console.error('FIREBASE_SERVICE_ACCOUNT environment variable contains invalid JSON or missing required fields.');
            }
        }
        // STRATEGY 2: Initialize from individual environment variables
        if (!firebaseInitialized && process.env.FIREBASE_PROJECT_ID &&
            process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            try {
                console.log('Attempting to initialize Firebase using individual environment variables...');
                // Replace escaped newlines with actual newlines in the private key and trim whitespace
                const privateKey = process.env.FIREBASE_PRIVATE_KEY.trim().replace(/\\n/g, '\n');
                // Validate the private key format
                if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
                    throw new Error('FIREBASE_PRIVATE_KEY has invalid format');
                }
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId: process.env.FIREBASE_PROJECT_ID.trim(),
                        clientEmail: process.env.FIREBASE_CLIENT_EMAIL.trim(),
                        privateKey: privateKey
                    })
                });
                firebaseInitialized = true;
                console.log('✅ Firebase Admin SDK initialized successfully using individual environment variables.');
            }
            catch (error) {
                console.error('❌ Firebase initialization error with individual environment variables:', error);
            }
        }
        // STRATEGY 3: Initialize from local JSON file if environment variables didn't work
        if (!firebaseInitialized) {
            try {
                console.log('Attempting to initialize Firebase using service account JSON file...');
                // Construct the path to the service account file relative to project root
                const serviceAccountPath = path.join(process.cwd(), 'config', 'firebase-service-account.json');
                if (fs.existsSync(serviceAccountPath)) {
                    console.log(`Found service account file at: ${serviceAccountPath}`);
                    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
                    // Validate the service account object
                    if (validateServiceAccount(serviceAccount)) {
                        admin.initializeApp({
                            credential: admin.credential.cert(serviceAccount)
                        });
                        firebaseInitialized = true;
                        console.log('✅ Firebase Admin SDK initialized successfully using service account file from config folder.');
                    }
                    else {
                        throw new Error('Service account file validation failed');
                    }
                }
                else {
                    console.error(`❌ Service account file not found at: ${serviceAccountPath}`);
                    throw new Error(`Service account file not found at: ${serviceAccountPath}`);
                }
            }
            catch (fileError) {
                console.error('❌ Firebase service account file error:', fileError);
                // STRATEGY 4: Last resort - try to initialize with application default credentials
                try {
                    console.log('Attempting to initialize Firebase using application default credentials...');
                    admin.initializeApp();
                    firebaseInitialized = true;
                    console.log('✅ Firebase Admin SDK initialized using application default credentials.');
                }
                catch (defaultError) {
                    console.error('❌ Firebase initialization with default credentials failed:', defaultError);
                }
            }
        }
    }
    catch (error) {
        console.error('❌ Firebase initialization error:', error);
    }
    // Final status report
    if (firebaseInitialized) {
        console.log('🔥 Firebase Admin SDK is ready to use');
    }
    else {
        console.error('❌ CRITICAL: Firebase Admin SDK could not be initialized. Firebase services will not be available.');
        console.error('Please check your Firebase configuration in environment variables or the service account file.');
    }
}
/**
 * Verifies a Firebase ID token and returns the decoded token if valid
 * @param idToken The Firebase ID token to verify
 * @returns The decoded token or null if verification fails
 */
export const verifyFirebaseToken = async (idToken) => {
    try {
        if (!firebaseInitialized) {
            console.error('Firebase is not initialized. Cannot verify token.');
            return null;
        }
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return decodedToken;
    }
    catch (error) {
        console.error('Firebase token verification error:', error);
        return null;
    }
};
/**
 * Gets a user by phone number from Firebase Auth
 * @param phoneNumber The phone number to lookup
 * @returns The user record or null if not found or Firebase is not available
 */
export const getUserByPhoneNumber = async (phoneNumber) => {
    try {
        if (!firebaseInitialized) {
            console.error('Firebase is not initialized. Cannot get user by phone number.');
            return null;
        }
        const userRecord = await admin.auth().getUserByPhoneNumber(phoneNumber);
        return userRecord;
    }
    catch (error) {
        console.error('Firebase getUserByPhoneNumber error:', error);
        return null;
    }
};
/**
 * Checks if Firebase Admin SDK is available for use
 * @returns boolean indicating if Firebase was successfully initialized
 */
export const isFirebaseAvailable = () => {
    return firebaseInitialized;
};
export default admin;
