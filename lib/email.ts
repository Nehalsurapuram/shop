const RESEND_ENDPOINT = "https://api.resend.com/emails";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailArgs) {
  const apiKey = process.env.RESEND_API_KEY;

  // Without a provider key the link still has to reach a developer somehow,
  // so fall back to the server log rather than silently dropping the email.
  if (!apiKey) {
    console.log(`\n[email] to: ${to}\n[email] subject: ${subject}\n${html}\n`);
    return;
  }

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to send email: ${res.status} ${await res.text()}`);
  }
}

export function otpEmail(otp: string) {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
      <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 16px;">Sign in to Thrift Flux</h1>
      <p style="color: #555; line-height: 1.6; margin: 0 0 24px;">
        Enter this code to finish signing in. It expires in 5 minutes.
      </p>
      <div style="font-size: 32px; font-weight: 700; letter-spacing: 0.3em; padding: 16px 24px; background: #f5f5f5; text-align: center; color: #111;">
        ${otp}
      </div>
      <p style="color: #888; font-size: 12px; line-height: 1.6; margin: 24px 0 0;">
        If you didn't request this, you can safely ignore this email. Never share this code with anyone.
      </p>
    </div>
  `;
}
