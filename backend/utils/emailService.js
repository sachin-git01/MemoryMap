export const sendLoginOtpEmail = async (email, otp, displayName = 'Explorer') => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your MemoryMap Login Code</title>
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
          <h2 class="title">Your Login Code</h2>
          <p class="text">Hi <strong>${displayName}</strong>,<br>Here is your 6-digit verification code to log in to your MemoryMap account:</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="expiry">⏱️ This code will expire in 10 minutes.</div>
          </div>

          <p class="text" style="font-size: 12px; margin-bottom: 0;">If you did not request this login code, please ignore this email.</p>
          <div class="footer">
            © ${new Date().getFullYear()} MemoryMap. Map Every Memory, From Love to Life.
          </div>
        </div>
      </body>
    </html>
  `;

  // 1. Primary: Brevo (Sendinblue) HTTPS REST API
  if (process.env.BREVO_API_KEY) {
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
          subject: `${otp} is your MemoryMap login code`,
          htmlContent: htmlContent
        })
      });

      const resData = await res.json();
      if (res.ok) {
        console.log(`[Brevo API] OTP email sent successfully to ${email} (Message ID: ${resData.messageId})`);
        return { success: true };
      } else {
        console.error(`[Brevo API Error]:`, resData);
      }
    } catch (brevoErr) {
      console.error(`[Brevo Fetch Error]:`, brevoErr.message);
    }
  }

  // 2. Secondary Fallback: Resend HTTPS REST API
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'MemoryMap <onboarding@resend.dev>',
          to: [email],
          subject: `${otp} is your MemoryMap login code`,
          html: htmlContent
        })
      });

      const resData = await res.json();
      if (res.ok) {
        console.log(`[Resend API] OTP email sent to ${email} (ID: ${resData.id})`);
        return { success: true };
      } else {
        console.error(`[Resend Error]:`, resData);
      }
    } catch (resendErr) {
      console.error(`[Resend Fetch Error]:`, resendErr.message);
    }
  }

  // Fallback for local console
  console.log(`\n========================================`);
  console.log(`[DEV OTP CODE] Recipient: ${email} | Code: ${otp}`);
  console.log(`========================================\n`);

  return { success: true, devMode: true };
};
