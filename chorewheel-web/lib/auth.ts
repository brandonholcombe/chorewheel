import NextAuth, { type NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { db } from '@/lib/db/client';
import { env } from '@/lib/env';
import { upsertUserByGoogle } from '@/lib/db/queries';

// Shape of the Google OpenID profile fields we rely on.
interface GoogleProfile {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

function buildConfig(): NextAuthConfig {
  const e = env();
  return {
    secret: e.APP_SESSION_SECRET,
    // Self-hosted behind nginx ingress (cluster) or next dev/start (local).
    // Auth.js v5 requires trustHost: true outside Vercel auto-detection.
    trustHost: true,
    session: { strategy: 'jwt' },
    providers: [
      Google({
        clientId: e.AUTH_GOOGLE_ID,
        clientSecret: e.AUTH_GOOGLE_SECRET,
      }),
    ],
    callbacks: {
      signIn({ profile }) {
        const p = profile as Partial<GoogleProfile> | undefined;
        if (!p?.sub || !p.email) return false;
        // Require a Google-verified email. Open enrollment otherwise — access
        // to any data is still gated by household membership, not by sign-in.
        if (p.email_verified === false) return false;
        upsertUserByGoogle(db(), {
          sub: p.sub,
          email: p.email,
          name: p.name ?? null,
          image: p.picture ?? null,
        });
        return true;
      },
      jwt({ token, profile }) {
        const p = profile as Partial<GoogleProfile> | undefined;
        if (p?.sub) {
          const user = upsertUserByGoogle(db(), {
            sub: p.sub,
            email: p.email ?? '',
            name: p.name ?? null,
            image: p.picture ?? null,
          });
          token.userId = user.id;
        }
        return token;
      },
      session({ session, token }) {
        if (token.userId) {
          session.user = {
            ...session.user,
            id: token.userId as string,
          };
        }
        return session;
      },
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth(buildConfig);
