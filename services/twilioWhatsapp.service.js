"use strict";

const twilio = require("twilio");

/**
 * Initializes and returns the Twilio client using Account SID and API Key/Secret.
 */
const getTwilioClient = () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID ? process.env.TWILIO_ACCOUNT_SID.trim() : null;
    const apiKey = process.env.TWILIO_API_KEY ? process.env.TWILIO_API_KEY.trim() : null;
    const apiSecret = process.env.TWILIO_API_SECRET ? process.env.TWILIO_API_SECRET.trim() : null;
    const authToken = process.env.TWILIO_AUTH_TOKEN ? process.env.TWILIO_AUTH_TOKEN.trim() : apiSecret;

    if (apiKey && apiSecret && accountSid) {
        return twilio(apiKey, apiSecret, { accountSid });
    }
    if (accountSid && authToken) {
        return twilio(accountSid, authToken);
    }
    throw new Error("Twilio is not completely configured. Please verify TWILIO_ACCOUNT_SID and TWILIO_API_KEY/SECRET in environment.");
};

/**
 * Normalizes phone number into international standard e.g. +919876543210
 */
const normalizePhone = (value) => {
    if (typeof value !== "string") return null;
    let cleaned = value.trim().replace(/[\s()-]/g, "");
    if (cleaned.startsWith("whatsapp:")) {
        cleaned = cleaned.replace("whatsapp:", "").trim();
    }
    if (/^\+[1-9]\d{7,14}$/.test(cleaned)) return cleaned;
    if (/^\d{10}$/.test(cleaned)) return `+91${cleaned}`;
    if (/^91\d{10}$/.test(cleaned)) return `+${cleaned}`;
    return null;
};

/**
 * Sends OTP to a WhatsApp number via Twilio WhatsApp API.
 * 
 * @param {string} phoneNumber - Recipient phone number (e.g. +919876543210)
 * @param {string} otp - 6-digit OTP code generated server-side
 * @param {string} purpose - "registration" or "login"
 * @returns {Promise<object>} Twilio message delivery status
 */
const sendWhatsappOtp = async (phoneNumber, otp, purpose = "verification") => {
    const normalized = normalizePhone(phoneNumber);
    if (!normalized) {
        throw new Error("A valid international phone number is required (e.g. +919876543210).");
    }

    const client = getTwilioClient();
    const toWhatsapp = `whatsapp:${normalized}`;

    // Sender resolution
    let fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER;
    if (fromNumber && !fromNumber.startsWith("whatsapp:")) {
        fromNumber = `whatsapp:${fromNumber}`;
    }
    if (!fromNumber) {
        fromNumber = "whatsapp:+14155238886"; // Twilio standard WhatsApp Sandbox number
    }

    const messageBody = `Your MBBS.NET ${purpose} code is: *${otp}*\n\nValid for 5 minutes. Please do not share this verification code with anyone.`;

    try {
        const message = await client.messages.create({
            from: fromNumber,
            to: toWhatsapp,
            body: messageBody
        });

        console.log(`[Twilio WhatsApp] OTP dispatched to ${toWhatsapp}, SID: ${message.sid}, Status: ${message.status}`);
        return {
            sid: message.sid,
            status: message.status,
            to: toWhatsapp,
            from: fromNumber
        };
    } catch (error) {
        console.error(`[Twilio WhatsApp Error] Failed to send OTP to ${toWhatsapp}:`, error.message);
        throw error;
    }
};

module.exports = {
    getTwilioClient,
    normalizePhone,
    sendWhatsappOtp
};
