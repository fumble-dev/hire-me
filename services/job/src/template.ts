export const applicationStatusUpdateTemplate = (jobTitle: string) => {
return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Application Status Update</title>
<style>
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background: #f5f5f5;
  }
  .container {
    max-width: 600px;
    background: #ffffff;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
  }
  h1 {
    font-size: 22px;
    margin-bottom: 20px;
  }
  p {
    font-size: 15px;
    color: #333;
    line-height: 1.5;
  }
  .footer {
    margin-top: 30px;
    font-size: 12px;
    color: #777;
    text-align: center;
  }
</style>
</head>

<body>
<div class="container">
  <h1>Application Status Update</h1>

  <p>Hi there,</p>

  <p>
    Your application for the position of
    <strong>${jobTitle}</strong> has been updated.
  </p>

  <p>
    You can check your application status anytime on <strong>Hire Me</strong>.
  </p>

  <p>Thank you for applying!</p>

  <div class="footer">
    <p>© 2025 Hire Me. All rights reserved.</p>
    <p>This is an automated message, please do not reply.</p>
  </div>
</div>
</body>
</html>
`;
};
