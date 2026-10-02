const sendBrevoEmail = async (email, subject, htmlContent) => {
  if (!process.env.BREVO_API_KEY) {
    return false;
  }

  try {
    const senderEmail = (process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER || 'sachinofficial7310@gmail.com').trim();
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY.trim(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'MemoryMap',
          email: senderEmail
        },
        to: [{ email }],
        subject,
        htmlContent
      })
    });

    const resData = await res.json();
    if (res.ok) {
      console.log(`[Brevo API] Email sent to ${email} (Message ID: ${resData.messageId})`);
      return true;
    } else {
      console.error(`[Brevo API Error]:`, resData);
      return false;
    }
  } catch (err) {
    console.error(`[Brevo Network Error]:`, err.message);
    return false;
  }
};

export const sendVerificationOtpEmail = async (email, otp, displayName = 'Explorer') => {
  const subject = `${otp} is your MemoryMap verification code`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your MemoryMap Account</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 36px 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
          .logo { text-align: center; margin-bottom: 24px; }
          .logo-text { font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
          .logo-highlight { color: #0284c7; }
          .title { font-size: 20px; font-weight: 700; text-align: center; margin-bottom: 10px; color: #0f172a; }
          .text { font-size: 14px; line-height: 1.6; color: #475569; text-align: center; margin-bottom: 24px; }
          .otp-box { background: #f0f9ff; border: 2px dashed #38bdf8; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #0369a1; font-family: 'Courier New', Courier, monospace; }
          .expiry { font-size: 12px; color: #64748b; text-align: center; margin-top: 10px; font-weight: 500; }
          .footer { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <span class="logo-text">Memory<span class="logo-highlight">Map</span></span>
          </div>
          <h2 class="title">Verify Your Account</h2>
          <p class="text">Welcome <strong>${displayName}</strong>!<br>Enter this 6-digit code to complete your registration:</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="expiry">⏱️ This code will expire in 10 minutes.</div>
          </div>

          <p class="text" style="font-size: 12px; margin-bottom: 0;">Once verified, you can log in anytime using your email and password.</p>
          <div class="footer">
            © ${new Date().getFullYear()} MemoryMap. Map Every Memory, From Love to Life.
          </div>
        </div>
      </body>
    </html>
  `;

  const sent = await sendBrevoEmail(email, subject, htmlContent);
  if (!sent) {
    console.log(`\n[DEV VERIFICATION OTP] Recipient: ${email} | Code: ${otp}\n`);
  }
  return { success: true };
};

export const sendPasswordResetOtpEmail = async (email, otp, displayName = 'Explorer') => {
  const subject = `${otp} is your MemoryMap password reset code`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your MemoryMap Password</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 36px 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
          .logo { text-align: center; margin-bottom: 24px; }
          .logo-text { font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
          .logo-highlight { color: #e11d48; }
          .title { font-size: 20px; font-weight: 700; text-align: center; margin-bottom: 10px; color: #0f172a; }
          .text { font-size: 14px; line-height: 1.6; color: #475569; text-align: center; margin-bottom: 24px; }
          .otp-box { background: #fff1f2; border: 2px dashed #fb7185; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #be123c; font-family: 'Courier New', Courier, monospace; }
          .expiry { font-size: 12px; color: #64748b; text-align: center; margin-top: 10px; font-weight: 500; }
          .footer { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <span class="logo-text">Memory<span class="logo-highlight">Map</span></span>
          </div>
          <h2 class="title">Reset Your Password</h2>
          <p class="text">Hi <strong>${displayName}</strong>,<br>We received a request to reset your password. Use the 6-digit code below to set your new password:</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="expiry">⏱️ This code will expire in 10 minutes.</div>
          </div>

          <p class="text" style="font-size: 12px; margin-bottom: 0;">If you didn't ask to reset your password, you can safely ignore this message.</p>
          <div class="footer">
            © ${new Date().getFullYear()} MemoryMap. Map Every Memory, From Love to Life.
          </div>
        </div>
      </body>
    </html>
  `;

  const sent = await sendBrevoEmail(email, subject, htmlContent);
  if (!sent) {
    console.log(`\n[DEV PASSWORD RESET OTP] Recipient: ${email} | Code: ${otp}\n`);
  }
  return { success: true };
};
