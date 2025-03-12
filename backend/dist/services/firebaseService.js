"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFirebaseAvailable = exports.getUserByPhoneNumber = exports.verifyFirebaseToken = void 0;
const admin = __importStar(require("firebase-admin"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Firebase Service for Phone Authentication
 * This module handles Firebase Admin SDK initialization with multiple fallback options:
 * 1. From FIREBASE_SERVICE_ACCOUNT environment variable (JSON string)
 * 2. From individual environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
 * 3. From a local JSON file at config/firebase-service-account.json
 * 4. Using application default credentials as a last resort
 */
// Guard to ensure initialization is done only once
if (!admin.apps.length) {
    console.log('Initializing Firebase Admin SDK...');
    let firebaseInitialized = false;
    try {
        // STRATEGY 1: Initialize from FIREBASE_SERVICE_ACCOUNT environment variable
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            try {
                console.log('Attempting to initialize Firebase using FIREBASE_SERVICE_ACCOUNT environment variable...');
                const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT.trim());
                if (serviceAccount && serviceAccount.project_id && serviceAccount.client_email && serviceAccount.private_key) {
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
            }
        }
        // STRATEGY 2: Initialize from individual environment variables
        if (!firebaseInitialized && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            try {
                console.log('Attempting to initialize Firebase using individual environment variables...');
                const privateKey = process.env.FIREBASE_PRIVATE_KEY.trim().replace(/\\n/g, '\n');
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
                const serviceAccountPath = path.join(process.cwd(), 'config', 'firebase-service-account.json');
                if (fs.existsSync(serviceAccountPath)) {
                    console.log(`Found service account file at: ${serviceAccountPath}`);
                    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
                    if (serviceAccount && serviceAccount.project_id && serviceAccount.client_email && serviceAccount.private_key) {
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
    if (firebaseInitialized) {
        console.log('🔥 Firebase Admin SDK is ready to use');
    }
    else {
        console.error('❌ CRITICAL: Firebase Admin SDK could not be initialized. Firebase services will not be available.');
    }
}
const verifyFirebaseToken = (idToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const decodedToken = yield admin.auth().verifyIdToken(idToken);
        return decodedToken;
    }
    catch (error) {
        console.error('Firebase token verification error:', error);
        return null;
    }
});
exports.verifyFirebaseToken = verifyFirebaseToken;
const getUserByPhoneNumber = (phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRecord = yield admin.auth().getUserByPhoneNumber(phoneNumber);
        return userRecord;
    }
    catch (error) {
        console.error('Firebase getUserByPhoneNumber error:', error);
        return null;
    }
});
exports.getUserByPhoneNumber = getUserByPhoneNumber;
const isFirebaseAvailable = () => {
    return admin.apps.length > 0;
};
exports.isFirebaseAvailable = isFirebaseAvailable;
exports.default = admin;
