import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import { pool } from "@/lib/db";
import { magicLinkEmail, sendEmail } from "@/lib/email";

export const auth = betterAuth({
  database: pool,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    magicLink({
      expiresIn: 60 * 5,
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          to: email,
          subject: "Sign in to Thrift Flux",
          html: magicLinkEmail(url),
        });
      },
    }),
    // nextCookies must stay last so it can pick up cookies set by other plugins.
    nextCookies(),
  ],
});
