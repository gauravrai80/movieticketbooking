import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { logEmailError, logEmailSuccess } from '../utils/emailLogger.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
    dns: {
        ipVersion: 4 // Force IPv4 to avoid timeouts on some environments
    }
});

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function sendEmailWithRetry(mailOptions, retries = MAX_RETRIES) {
    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        if (retries > 0) {
            console.warn(`Email send failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return sendEmailWithRetry(mailOptions, retries - 1);
        }
        throw error;
    }
}

// Templates
const emailTemplates = {
    bookingConfirmation: (booking, movie, showtime, theater) => {
        const dateStr = new Date(showtime.startTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = new Date(showtime.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

        return {
            subject: `Booking Confirmed: ${movie.title}`,
            html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #e11d48; padding: 20px; text-align: center; color: white;">
                <h1 style="margin: 0;">Booking Confirmed!</h1>
            </div>
            <div style="padding: 20px;">
                <p>Hi there,</p>
                <p>Your booking for <strong>${movie.title}</strong> has been confirmed.</p>
                
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Confirmation Code:</strong> <span style="color: #e11d48; font-size: 1.2em;">${booking.bookingReference}</span></p>
                    <p style="margin: 5px 0;"><strong>Theater:</strong> ${theater.name}</p>
                    <p style="margin: 5px 0;"><strong>Date:</strong> ${dateStr}</p>
                    <p style="margin: 5px 0;"><strong>Time:</strong> ${timeStr}</p>
                    <p style="margin: 5px 0;"><strong>Seats:</strong> ${booking.seats.join(', ')}</p>
                    <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${booking.totalAmount}</p>
                </div>

                <p style="color: #64748b; font-size: 0.9em;">Please show this email or your ticket code at the entrance.</p>
            </div>
            <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 0.8em; color: #64748b;">
                <p>Enjoy the movie!</p>
                <p>${process.env.SENDER_NAME}</p>
            </div>
        </div>
      `
        };
    },
    bookingCancellation: (booking, movie, refundAmount) => {
        return {
            subject: `Booking Cancelled: ${movie.title}`,
            html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e11d48;">Booking Cancelled</h2>
            <p>Your booking (Ref: <strong>${booking.bookingReference}</strong>) for <strong>${movie.title}</strong> has been cancelled as requested.</p>
            <p>A refund of <strong>₹${refundAmount}</strong> has been initiated and will appear in your account shortly.</p>
        </div>
      `
        };
    },
    bookingReminder: (booking, movie, showtime, theater) => {
        const timeStr = new Date(showtime.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        return {
            subject: `Reminder: ${movie.title} Tomorrow!`,
            html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Don't forget the popcorn! 🍿</h2>
            <p>This is a reminder that you have a show coming up tomorrow.</p>
            <p><strong>Movie:</strong> ${movie.title}</p>
            <p><strong>Time:</strong> ${timeStr}</p>
            <p><strong>Location:</strong> ${theater.name}</p>
            <p>See you there!</p>
        </div>
      `
        };
    },
    showtimeChange: (booking, movie, oldShowtime, newShowtime, theater) => {
        const oldDateStr = new Date(oldShowtime.startTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
        const newDateStr = new Date(newShowtime.startTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

        return {
            subject: `IMPORTANT: Showtime Rescheduled - ${movie.title}`,
            html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f59e0b; padding: 20px; text-align: center; color: white;">
                <h2 style="margin: 0;">Showtime Changed</h2>
            </div>
            <div style="padding: 20px;">
                <p>Hi there,</p>
                <p>The time for your screening of <strong>${movie.title}</strong> has been changed.</p>
                
                <div style="background-color: #fff7ed; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Theater:</strong> ${theater.name}</p>
                    <p style="margin: 5px 0; text-decoration: line-through; color: #9ca3af;"><strong>Old Time:</strong> ${oldDateStr}</p>
                    <p style="margin: 5px 0; color: #ea580c; font-weight: bold;"><strong>New Time:</strong> ${newDateStr}</p>
                </div>

                <p>Your tickets (Ref: <strong>${booking.bookingReference}</strong>) are automatically valid for the new time.</p>
                <p>If this new time does not work for you, please contact support for a full refund or to reschedule.</p>
            </div>
        </div>
      `
        };
    }
};

export const sendBookingConfirmation = async (user, booking, movie, showtime, theater) => {
    try {
        const { subject, html } = emailTemplates.bookingConfirmation(booking, movie, showtime, theater);
        await sendEmailWithRetry({
            from: `"${process.env.SENDER_NAME}" <${process.env.GMAIL_EMAIL}>`,
            to: user.email,
            subject,
            html
        });
        logEmailSuccess(booking._id, user.email, 'Confirmation');
    } catch (error) {
        logEmailError(booking._id, user.email, error);
        throw error;
    }
};

export const sendCancellationConfirmation = async (user, booking, movie, refundAmount) => {
    try {
        const { subject, html } = emailTemplates.bookingCancellation(booking, movie, refundAmount);
        await sendEmailWithRetry({
            from: `"${process.env.SENDER_NAME}" <${process.env.GMAIL_EMAIL}>`,
            to: user.email,
            subject,
            html
        });
        logEmailSuccess(booking._id, user.email, 'Cancellation');
    } catch (error) {
        logEmailError(booking._id, user.email, error);
        throw error;
    }
};

export const sendBookingReminder = async (user, booking, movie, showtime, theater) => {
    try {
        const { subject, html } = emailTemplates.bookingReminder(booking, movie, showtime, theater);
        await sendEmailWithRetry({
            from: `"${process.env.SENDER_NAME}" <${process.env.GMAIL_EMAIL}>`,
            to: user.email,
            subject,
            html
        });
        logEmailSuccess(booking._id, user.email, 'Reminder');
    } catch (error) {
        logEmailError(booking._id, user.email, error);
        throw error;
    }
};

export const sendShowtimeChangeNotification = async (user, booking, movie, oldShowtime, newShowtime, theater) => {
    try {
        const { subject, html } = emailTemplates.showtimeChange(booking, movie, oldShowtime, newShowtime, theater);
        await sendEmailWithRetry({
            from: `"${process.env.SENDER_NAME}" <${process.env.GMAIL_EMAIL}>`,
            to: user.email,
            subject,
            html
        });
        logEmailSuccess(booking._id, user.email, 'ShowtimeChange');
    } catch (error) {
        logEmailError(booking._id, user.email, error);
        throw error;
    }
};

export default transporter;
