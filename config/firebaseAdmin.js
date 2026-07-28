const { applicationDefault, cert, getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

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
        return {
            projectId: FIREBASE_PROJECT_ID,
            clientEmail: FIREBASE_CLIENT_EMAIL,
            privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        };
    }
    return null;
};

const getFirebaseAuth = () => {
    if (!getApps().length) {
        const serviceAccount = serviceAccountFromEnv();
        initializeApp({
            credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
            projectId: process.env.FIREBASE_PROJECT_ID || "mbbs-e6f31"
        });
    }
    return getAuth();
};

module.exports = { getFirebaseAuth };
