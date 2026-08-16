"use strict";

const twilio = require("twilio");

/**
 * Initializes and returns the Twilio client using Account SID and Auth Token / API Key.
 */
const getTwilioClient = () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID ? process.env.TWILIO_ACCOUNT_SID.trim() : null;
    const authToken = process.env.TWILIO_AUTH_TOKEN ? process.env.TWILIO_AUTH_TOKEN.trim() : null;
    const apiKey = process.env.TWILIO_API_KEY ? process.env.TWILIO_API_KEY.trim() : null;
    const apiSecret = process.env.TWILIO_API_SECRET ? process.env.TWILIO_API_SECRET.trim() : null;

    if (accountSid && authToken) {
        return twilio(accountSid, authToken);
    }
    if (apiKey && apiSecret && accountSid) {
        return twilio(apiKey, apiSecret, { accountSid });
    }
    if (accountSid && apiSecret) {
        return twilio(accountSid, apiSecret);
    }
    throw new Error("Twilio is not completely configured. Please verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in environment.");
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
 * Sends OTP to a phone number via WhatsApp with automatic SMS fallback.
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
    const rawSender = process.env.TWILIO_PHONE_NUMBER ? process.env.TWILIO_PHONE_NUMBER.trim() : "+12605688334";
    const waSender = rawSender.startsWith("whatsapp:") ? rawSender : `whatsapp:${rawSender}`;
    const messageBody = `Your MBBS.NET ${purpose} code is: *${otp}*\n\nValid for 5 minutes. Please do not share this code with anyone.`;

    // 1. Attempt WhatsApp Delivery
    try {
        const message = await client.messages.create({
            from: waSender,
            to: toWhatsapp,
            body: messageBody
        });
        console.log(`[Twilio WhatsApp] OTP dispatched to ${toWhatsapp}, SID: ${message.sid}, Status: ${message.status}`);
        return {
            channel: "whatsapp",
            sid: message.sid,
            status: message.status,
            to: toWhatsapp,
            from: waSender
        };
    } catch (waError) {
        console.warn(`[Twilio WhatsApp Notice] (${waError.message}). Attempting instant SMS fallback to ${normalized}...`);
        
        // 2. Instant SMS Fallback for full delivery reliability
        try {
            const smsMessage = await client.messages.create({
                from: rawSender.replace("whatsapp:", ""),
                to: normalized,
                body: `Your MBBS.NET ${purpose} code is: ${otp}. Valid for 5 minutes. Do not share this OTP.`
            });
            console.log(`[Twilio SMS Fallback] OTP dispatched via SMS to ${normalized}, SID: ${smsMessage.sid}, Status: ${smsMessage.status}`);
            return {
                channel: "sms",
                sid: smsMessage.sid,
                status: smsMessage.status,
                to: normalized,
                from: rawSender
            };
        } catch (smsError) {
            console.error(`[Twilio SMS Fallback Failed] Error: ${smsError.message}`);
            throw waError;
        }
    }
};

module.exports = {
    getTwilioClient,
    normalizePhone,
    sendWhatsappOtp
};
