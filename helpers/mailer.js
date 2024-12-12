const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendMail = async (email, subject, normalPassword) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: subject,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmation</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f1f1f1;
      margin: 0;
      padding: 0;
    }

    .email-container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .email-header {
      background-color: #4CAF50;
      padding: 40px;
      text-align: center;
      color: #ffffff;
    }

    .email-header h1 {
      font-size: 36px;
      margin: 0;
      font-weight: bold;
    }

    .email-header p {
      font-size: 18px;
      margin: 5px 0;
    }

    .email-body {
      padding: 20px;
      font-size: 16px;
      color: #333333;
      line-height: 1.6;
    }

    .email-body p {
      margin-bottom: 20px;
    }

    .email-body b {
      color: #4CAF50;
    }

    .button {
      display: inline-block;
      background-color: #4CAF50;
      color: white;
      padding: 12px 25px;
      font-size: 16px;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 20px;
      text-align: center;
    }

    .email-footer {
      text-align: center;
      background-color: #f8f8f8;
      padding: 20px;
      font-size: 14px;
      color: #777777;
    }

    .email-footer p {
      margin: 0;
    }

    @media screen and (max-width: 600px) {
      .email-header h1 {
        font-size: 28px;
      }

      .email-body {
        padding: 15px;
      }

      .button {
        width: 100%;
        padding: 15px;
        text-align: center;
      }
    }
  </style>
</head>
<body>

  <div class="email-container">
    <div class="email-header">
      <h1>Welcome to 11za!</h1>
      <p>We're thrilled to have you on board.</p>
    </div>

    <div class="email-body">
      <p>Thank you for registering with us. Below are your account details:</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Password:</b> ${normalPassword}</p>
      <p>If you did not register, please ignore this email.</p>
      <a href="#" class="button">Go to Dashboard</a>
    </div>

    <div class="email-footer">
      <p>Best Regards, <br> The 11za Team</p>
      <p>For any support, contact us at support@11za.com</p>
    </div>
  </div>

</body>
</html>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent");
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

module.exports = { sendMail };
