import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

const emailHeader = `
  <div style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Konza Coin</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Secure Cryptocurrency Platform</p>
  </div>
`

const emailFooter = `
  <div style="background-color: #f8fafc; padding: 30px 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
    <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.6;">
      © 2025 Konza Coin. All rights reserved.<br>
      This is a secure communication from Konza Coin. Do not share verification codes or reset links with anyone.
    </p>
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
      <p style="color: #94a3b8; font-size: 11px; margin: 0;">
        <strong>Security Notice:</strong> Konza Coin will never ask for your password or verification codes via email. Always verify links match our official domain.
      </p>
    </div>
  </div>
`

export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: `${process.env.SMTP_FROM_NAME || "Konza Coin"} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: email,
      subject: "📧 Verify Your Email - Konza Coin Account",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          ${emailHeader}
          
          <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 20px 0;">Welcome to Konza Coin!</h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for signing up. We're excited to have you join our growing community of cryptocurrency enthusiasts and investors.
            </p>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              To complete your registration and secure your account, please verify your email using the code below:
            </p>
            
            <div style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border: 2px solid #14b8a6; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
              <p style="color: #64748b; font-size: 13px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
              <h1 style="color: #14b8a6; letter-spacing: 8px; font-size: 40px; margin: 0; font-weight: bold; font-family: 'Courier New', monospace;">${code}</h1>
              <p style="color: #64748b; font-size: 12px; margin: 12px 0 0 0;">Valid for 15 minutes</p>
            </div>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 30px 0;">
              <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.6;">
                <strong>⚠️ Security Tip:</strong> Never share this code with anyone. Konza Coin staff will never ask for your verification code via email or any other channel.
              </p>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
              If you didn't create a Konza Coin account, please ignore this email or <a href="mailto:support@konzacoin.com" style="color: #14b8a6; text-decoration: none; font-weight: 500;">contact our support team</a>.
            </p>
          </div>
          
          ${emailFooter}
        </div>
      `,
    })
  } catch (error) {
    console.error("[v0] Failed to send verification email:", error)
    throw new Error("Failed to send verification email")
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  try {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`

    await transporter.sendMail({
      from: `${process.env.SMTP_FROM_NAME || "Konza Coin"} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: email,
      subject: "🔐 Reset Your Password - Konza Coin",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          ${emailHeader}
          
          <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 20px 0;">Password Reset Request</h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              We received a request to reset the password for your Konza Coin account associated with this email address.
            </p>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              To protect your account security, this link will expire in 10 minutes. Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; border: none; cursor: pointer; box-shadow: 0 4px 6px rgba(20, 184, 166, 0.3);">
                Reset Password
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 13px; text-align: center; margin: 20px 0;">Or copy this link:</p>
            <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; word-break: break-all; color: #475569; font-size: 12px; font-family: 'Courier New', monospace;">
              ${resetLink}
            </div>
            
            <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin: 30px 0;">
              <p style="color: #991b1b; font-size: 13px; margin: 0; line-height: 1.6;">
                <strong>🔒 Important:</strong> If you did not request this password reset, please <strong>ignore this email</strong> or <a href="mailto:security@konzacoin.com" style="color: #dc2626; text-decoration: none;">contact our security team</a> immediately. Your account remains secure.
              </p>
            </div>
            
            <div style="background-color: #ecfdf5; border-left: 4px solid #14b8a6; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="color: #065f46; font-size: 13px; margin: 0; line-height: 1.6;">
                <strong>💡 Pro Tip:</strong> Create a strong password with at least 12 characters, including uppercase, lowercase, numbers, and special characters.
              </p>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
              Have questions? Our support team is here to help at <a href="mailto:support@konzacoin.com" style="color: #14b8a6; text-decoration: none; font-weight: 500;">support@konzacoin.com</a>
            </p>
          </div>
          
          ${emailFooter}
        </div>
      `,
    })
  } catch (error) {
    console.error("[v0] Failed to send password reset email:", error)
    throw new Error("Failed to send password reset email")
  }
}

export async function send2FAEmail(email: string, code: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: `${process.env.SMTP_FROM_NAME || "Konza Coin"} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: email,
      subject: "🔐 Two-Factor Authentication Code - Konza Coin",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          ${emailHeader}
          
          <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 20px 0;">Two-Factor Authentication Code</h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              A login attempt to your Konza Coin account has been detected. To complete the login process, enter the authentication code below:
            </p>
            
            <div style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border: 2px solid #14b8a6; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
              <p style="color: #64748b; font-size: 13px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">Authentication Code</p>
              <h1 style="color: #14b8a6; letter-spacing: 8px; font-size: 40px; margin: 0; font-weight: bold; font-family: 'Courier New', monospace;">${code}</h1>
              <p style="color: #64748b; font-size: 12px; margin: 12px 0 0 0;">Valid for 5 minutes</p>
            </div>
            
            <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin: 30px 0;">
              <p style="color: #991b1b; font-size: 13px; margin: 0; line-height: 1.6;">
                <strong>⚠️ URGENT:</strong> If you didn't attempt to log in to your account, your account may be under attack. <strong>Do not share this code</strong> with anyone. Change your password immediately and contact <a href="mailto:security@konzacoin.com" style="color: #dc2626; text-decoration: none; font-weight: 600;">security@konzacoin.com</a>.
              </p>
            </div>
            
            <div style="background-color: #ecfdf5; border-left: 4px solid #14b8a6; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="color: #065f46; font-size: 13px; margin: 0; line-height: 1.6;">
                <strong>🛡️ Security Reminder:</strong> Konza Coin will never ask for your 2FA code. Never share this code with anyone, not even our support team.
              </p>
            </div>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.6;">
                <strong>💡 Tip:</strong> If you have 2FA enabled, always verify you're logging in from a trusted device.
              </p>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
              Questions about your account security? Contact our support team at <a href="mailto:support@konzacoin.com" style="color: #14b8a6; text-decoration: none; font-weight: 500;">support@konzacoin.com</a>
            </p>
          </div>
          
          ${emailFooter}
        </div>
      `,
    })
  } catch (error) {
    console.error("[v0] Failed to send 2FA email:", error)
    throw new Error("Failed to send 2FA email")
  }
}

export async function sendAdminEmail(email: string, subject: string, message: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: `${process.env.SMTP_FROM_NAME || "Konza Coin"} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          ${emailHeader}
          
          <div style="padding: 40px 30px; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border-left: 4px solid #14b8a6; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
              <p style="color: #065f46; font-size: 14px; margin: 0; line-height: 1.6;">
                <strong>Message from Konza Coin Team</strong>
              </p>
            </div>
            
            <div style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0; word-break: break-word; white-space: pre-wrap;">
              ${message}
            </div>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 30px 0;">
              <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.6;">
                <strong>📌 Important:</strong> This is an official communication from Konza Coin. If you have any questions, please contact our support team.
              </p>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
              Thank you for being part of the Konza Coin community!
            </p>
          </div>
          
          ${emailFooter}
        </div>
      `,
    })
  } catch (error) {
    console.error("[v0] Failed to send admin email:", error)
    throw new Error("Failed to send admin email")
  }
}
