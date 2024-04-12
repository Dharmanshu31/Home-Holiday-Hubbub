import * as nodemailer from 'nodemailer';

export const sendEmail = async (mailData) => {
  const transporter: nodemailer.Transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailOptions = {
    from: 'Admin Department <no-reply@homeholidayhubbub.com>',
    to: mailData.email,
    subject: mailData.subject,
    html: mailData.html,
  };
  await transporter.sendMail(mailOptions);
};
