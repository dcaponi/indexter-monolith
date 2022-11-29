import nodemailer from 'nodemailer'

import Mail from 'nodemailer/lib/mailer';

import { Emailer } from ".";

export interface Email {
    from: string
    to: string
    subject: string
    html: string
}

export class NodeEmailer implements Emailer {
    // todo all this email shit should live in a worker that pulls from a queue
    private mailer: Mail | null = null;

    constructor() {
        this.mailer = nodemailer.createTransport({
            service: process.env.BUSINESS_EMAIL_SERVICE || '',
            auth: {
                user: process.env.BUSINESS_EMAIL || '',
                pass: process.env.BUSINESS_EMAIL_APP_PASSWORD || ''
            }
        });
    }

    send = (email: Email): void => {
        if(!this.mailer) {
            throw new Error("emailer not configured")
        }
        this.mailer.sendMail(email, error => {
            if (error) {
                console.log(error);
                throw error;
            }
        });
    }
}
