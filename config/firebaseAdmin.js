const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getMessaging } = require("firebase-admin/messaging");

const serviceAccountFromEnv = () => {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        try {
            return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        } catch {
            throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON must be valid JSON.");
        }
    }

    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
    if (FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
        let privateKey = String(FIREBASE_PRIVATE_KEY).trim();
        if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
            privateKey = privateKey.slice(1, -1);
        }
        return {
            projectId: FIREBASE_PROJECT_ID || "mbbs-e6f31",
            clientEmail: FIREBASE_CLIENT_EMAIL.trim(),
            privateKey: privateKey.replace(/\\n/g, "\n")
        };
    }
    return null;
};

const initializeFirebaseApp = () => {
    if (!getApps().length) {
        const serviceAccount = serviceAccountFromEnv();
        if (serviceAccount) {
            initializeApp({
                credential: cert(serviceAccount),
                projectId: serviceAccount.projectId || process.env.FIREBASE_PROJECT_ID || "mbbs-e6f31"
            });
        } else {
            initializeApp({
                credential: applicationDefault(),
                projectId: process.env.FIREBASE_PROJECT_ID || "mbbs-e6f31"
            });
        }
    }
    return getApps()[0];
};

const getFirebaseAuth = () => {
    initializeFirebaseApp();
    return getAuth();
};

const getFirebaseMessaging = () => {
    initializeFirebaseApp();
    return getMessaging();
};

const isFirebaseConfigured = () => {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) return true;
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) return true;
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return true;
    return getApps().length > 0;
};

module.exports = {
    initializeFirebaseApp,
    getFirebaseAuth,
    getFirebaseMessaging,
    isFirebaseConfigured
};
