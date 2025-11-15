const forgotPasswordEmail = (name, resetLink, expireMinutes) => {
  return {
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: #007bff; color: white; padding: 16px; text-align: center; font-size: 20px;">
            Password Reset Request 🔐
          </div>

          <div style="padding: 24px;">
            <p>Hi <b>${name}</b>,</p>
            <p>We received a request to reset your password. You can reset it by clicking the button below:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>

            <p>If the button doesn’t work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #007bff;">${resetLink}</p>

            <p><strong>Note:</strong> This link will expire in <b>${expireMinutes} minutes</b>. Please complete the process before it expires.</p>

            <p>If you didn't request a password reset, you can safely ignore this email.</p>
          </div>

          <div style="background: #f8f8f8; padding: 12px; text-align: center; font-size: 12px; color: #777;">
            &copy; ${new Date().getFullYear()} Our App. All rights reserved.
          </div>
        </div>
      </div>
    `,
  };
};


export default forgotPasswordEmail;
