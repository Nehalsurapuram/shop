import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { pool } from "@/lib/db";
import { otpEmail, sendEmail } from "@/lib/email";

export const auth = betterAuth({
  database: pool,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    emailOTP({
      expiresIn: 60 * 5,
      otpLength: 6,
      // Stored hashed, so a leaked verification row can't be turned back into a
      // working code. Retries are capped so a 6-digit code can't be brute-forced.
      storeOTP: "hashed",
      allowedAttempts: 5,
      sendVerificationOTP: async ({ email, otp, type }) => {
        // The plugin also issues codes for email-verification and password reset;
        // this app only uses sign-in, but keep the subject honest for any type.
        await sendEmail({
          to: email,
          subject:
            type === "sign-in"
              ? `${otp} is your Thrift Flux sign-in code`
              : `${otp} is your Thrift Flux verification code`,
          html: otpEmail(otp),
        });
      },
    }),
    // nextCookies must stay last so it can pick up cookies set by other plugins.
    nextCookies(),
  ],
});
