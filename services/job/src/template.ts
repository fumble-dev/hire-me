export const applicationStatusUpdateTemplate = (jobTitle: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Application Status Update</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background:#f4f4f4;">
  <div style="max-width:600px; margin:40px auto; background:#ffffff; padding:24px; border-radius:6px;">
    
    <h2 style="margin-top:0; color:#333;">
      Application Status Update
    </h2>

    <p style="color:#333; font-size:14px;">
      Hi,
    </p>

    <p style="color:#333; font-size:14px;">
      Your application for the position of
      <strong>${jobTitle}</strong>
      has been updated.
    </p>

    <p style="color:#555; font-size:14px;">
      Please log in to HireHeaven to check the latest status.
    </p>

    <p style="color:#555; font-size:14px;">
      Thank you for applying.
    </p>

    <hr style="border:none; border-top:1px solid #e0e0e0; margin:24px 0;" />

    <p style="color:#999; font-size:12px; margin:0;">
      © 2025 HireHeaven
    </p>
    <p style="color:#999; font-size:12px; margin:4px 0 0;">
      This is an automated email. Please do not reply.
    </p>

  </div>
</body>
</html>
`;
};
