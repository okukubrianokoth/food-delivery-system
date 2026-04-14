import nodemailer from 'nodemailer';

const createGmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const createEtherealTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return { transporter, testAccount };
};

const sendEmail = async (options) => {
  const mailOptions = {
    from: `"Food Delivery" <${process.env.EMAIL_USER || 'no-reply@example.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  let transporter;
  let usingEthereal = false;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = createGmailTransporter();
  } else {
    const etherealData = await createEtherealTransporter();
    transporter = etherealData.transporter;
    usingEthereal = true;
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    return { previewUrl, usingEthereal };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      const etherealData = await createEtherealTransporter();
      const info = await etherealData.transporter.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      return { previewUrl, usingEthereal: true };
    }
    throw error;
  }
};

export default sendEmail;