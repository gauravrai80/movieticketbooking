import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'logs', 'email-errors.log');

export const logEmailError = (bookingId, recipientEmail, error) => {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] Booking: ${bookingId} | Email: ${recipientEmail} | Error: ${error.message}\n`;

    // Ensure logs directory exists
    if (!fs.existsSync(path.dirname(LOG_FILE))) {
        fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    }

    fs.appendFileSync(LOG_FILE, message);
    console.error('[Email Logger]', message.trim());
};

export const logEmailSuccess = (bookingId, recipientEmail, emailType) => {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] SUCCESS | Type: ${emailType} | Booking: ${bookingId} | Email: ${recipientEmail}\n`;

    if (!fs.existsSync(path.dirname(LOG_FILE))) {
        fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    }

    fs.appendFileSync(LOG_FILE, message);
    console.log('[Email Logger]', message.trim());
};
