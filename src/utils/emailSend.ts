import * as todoModel from '../model/todoModel';
import { Express } from 'express';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();


const transporter = nodemailer.createTransport({
  service: 'gmail',
   host: 'live.smtp.mailtrap.io',
  port: 587,
  secure: false, // use SSL
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_APP_PASSWORD
  }
});


export const sendEmail = async (mailOptions: nodemailer.SendMailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

