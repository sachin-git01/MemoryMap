import nodemailer from 'nodemailer';

// List of common disposable / temporary email domains to block
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'sharklasers.com',
  'dispostable.com',
  'yopmail.com',
  'getairmail.com',
  'throwawaymail.com',
  'trashmail.com',
  'fakeinbox.com',
  'tempail.com',
  'crazymailing.com',
  'fakemailgenerator.com',
  'mytemp.email',
  'dropmail.me'
]);

export const isDisposableEmail = (email) => {
  if (!email || typeof email !== 'string') return true;
  const parts = email.toLowerCase().trim().split('@');
  if (parts.length !== 2) return true;
  const domain = parts[1];
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
};

// Create transporter based on env variables with strict timeouts
const getTransporter = () => {
  const user = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
  const pass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || '').trim().replace(/\s+/g, '');

  if (user && pass) {
    if (process.env.EMAIL_HOST) {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        secure: process.env.EMAIL_PORT === '465',
        auth: { user, pass },
        connectionTimeout: 4000,
        greetingTimeout: 4000,
        socketTimeout: 5000
      });
    }

    // Default to Gmail with strict timeouts so it never hangs requests
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      connectionTimeout: 4000,
      greetingTimeout: 4000,
      socketTimeout: 5000
    });
  }

  return null;
};

export const sendVerificationOtpEmail = async (email, otp, displayName = 'Explorer') => {
  const transporter = getTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your MemoryMap Account</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 36px 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
          .logo { text-align: center; margin-bottom: 24px; }
          .logo-text { font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
          .logo-highlight { color: #0284c7; }
          .title { font-size: 20px; font-weight: 700; text-align: center; margin-bottom: 12px; color: #0f172a; }
          .text { font-size: 14px; line-height: 1.6; color: #475569; text-align: center; margin-bottom: 28px; }
          .otp-box { background: #f0f9ff; border: 2px dashed #38bdf8; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0369a1; font-family: 'Courier New', Courier, monospace; }
          .expiry { font-size: 12px; color: #64748b; text-align: center; margin-top: 12px; }
          .footer { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <span class="logo-text">Memory<span class="logo-highlight">Map</span></span>
          </div>
          <h2 class="title">Verify Your Email Address</h2>
          <p class="text">Hi <strong>${displayName}</strong>,<br>Thank you for joining MemoryMap. Use the 6-digit verification code below to activate your account and start mapping your cherished moments:</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="expiry">⏱️ This code expires in 10 minutes.</div>
          </div>

          <p class="text" style="font-size: 12px; margin-bottom: 0;">If you did not request this verification, please ignore this email.</p>
          <div class="footer">
            © ${new Date().getFullYear()} MemoryMap. Map Every Memory, From Love to Life.
          </div>
        </div>
      </body>
    </html>
  `;

  if (transporter) {
    try {
      const sendPromise = transporter.sendMail({
        from: `"MemoryMap" <${process.env.EMAIL_USER || 'no-reply@memorymap.com'}>`,
        to: email,
        subject: `${otp} is your MemoryMap verification code`,
        html: htmlContent
      });

      // Max 3.5s timeout so signup response NEVER hangs
      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve({ timeout: true }), 3500)
      );

      const result = await Promise.race([sendPromise, timeoutPromise]);

      if (result && result.timeout) {
        console.warn(`[Email Service Warning] SMTP connection timed out after 3.5s for ${email}. Falling back to instant code.`);
        return { success: false, timeout: true, fallbackOtp: otp };
      }

      console.log(`[Email Service] Verification OTP sent to ${email} (Message ID: ${result?.messageId})`);
      return { success: true };
    } catch (err) {
      console.error(`[Email Service Error] Failed to send email to ${email}:`, err.message);
      return { success: false, fallbackOtp: otp, error: err.message };
    }
  } else {
    console.log(`\n========================================`);
    console.log(`[EMAIL VERIFICATION (No SMTP set in .env)]`);
    console.log(`Recipient: ${email}`);
    console.log(`Verification Code (OTP): ${otp}`);
    console.log(`========================================\n`);
    return { success: true, devMode: true, fallbackOtp: otp };
  }
};
