export const forgotPasswordTemplate = (resetLink: string) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Reset Password</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background:#ffffff; color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <h3 style="margin-top:0;">Reset your password</h3>

              <p>
                You requested a password reset for your HireMe account.
              </p>

              <p>
                Click the link below to set a new password:
              </p>

              <p>
                <a href="${resetLink}" style="color:#0066cc;">
                  ${resetLink}
                </a>
              </p>

              <p>
                This link will expire in <strong>15 minutes</strong>.
              </p>

              <p>
                If you didn’t request this, you can safely ignore this email.
              </p>

              <p style="margin-top:40px; font-size:12px; color:#777;">
                — HireMe
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};
