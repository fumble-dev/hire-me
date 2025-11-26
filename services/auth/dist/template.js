export const forgotPasswordTemplate = (resetLink) => {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #fafafa;
    }
    .email-container {
      max-width: 600px;
      background: #ffffff;
      margin: 30px auto;
      border: 1px solid #e5e5e5;
      padding: 20px;
      border-radius: 4px;
    }
    h1 {
      font-size: 22px;
      margin-bottom: 20px;
    }
    p {
      font-size: 14px;
      color: #333;
      line-height: 1.5;
      margin-bottom: 15px;
    }
    .button-wrapper {
      margin: 25px 0;
      text-align: center;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      background: #4a63e7;
      color: #fff;
      text-decoration: none;
      border-radius: 4px;
      font-size: 14px;
    }
    .link-box {
      padding: 10px;
      background: #f1f1f1;
      border: 1px solid #ddd;
      font-size: 13px;
      word-break: break-all;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      margin-top: 25px;
      font-size: 12px;
      color: #888;
    }
  </style>
  </head>
  
  <body>
    <div class="email-container">
      <h1>Reset Your Password - Hire Me</h1>

      <p>Hi there,</p>

      <p>We received a request to reset your password. Click the button below to set a new one:</p>

      <div class="button-wrapper">
        <a href="${resetLink}" class="button">Reset Password</a>
      </div>

      <p>If the button doesn't work, use this link:</p>

      <div class="link-box">${resetLink}</div>

      <p><strong>This link expires in 15 minutes.</strong></p>

      <p>If you didn't request this, you can safely ignore the email.</p>

      <div class="footer">
        <p>© 2025 Hire Me. All rights reserved.</p>
        <p>This is an automated message, please do not reply.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};
