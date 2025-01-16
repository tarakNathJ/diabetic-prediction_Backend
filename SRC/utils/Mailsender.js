import nodemailer from 'nodemailer'
import {ApiError} from './ApiError.js';


export const MailSender = async(email, title, body) => {
    try {
        // transporter
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
        // mailsend

        const info = await transporter.sendMail({

            from: `NGO`,
            to: `${email}`,
            subject: title,
            html: `${body}`,
        })

        return info;

    } catch (error) {
        throw new ApiError(400,"mail sending failed");
    }
}

