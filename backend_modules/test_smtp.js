const nodemailer = require("nodemailer");

const SMTP_SECURE = (process.env.SMTP_SECURE && process.env.SMTP_SECURE === 'FALSE') ? false : true;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM_MAIL = process.env.SMTP_FROM_MAIL;
const SEND_TO = process.env.SEND_TO

const sendMail = async (subject, text) => {
    const mail = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 456,
        secure: SMTP_SECURE, // true for 465, false for other ports
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        }
    });

    let info = await mail.sendMail({
        from: '"OwnCloud Reporting 📈" <' + SMTP_FROM_MAIL + '>',
        to: SEND_TO, // list of receivers
        subject,
        text,
    });
    console.log('info', info)
    return info;
};

sendMail('this is a test', 'test content')
