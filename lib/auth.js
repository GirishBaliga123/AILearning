import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { compare } from 'bcryptjs';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import prisma from './prisma';

// Rate limiter for login: 5 attempts per minute per email
const loginRateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
});

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }
        // Rate limit by email
        try {
          await loginRateLimiter.consume(credentials.email.toLowerCase());
        } catch {
          throw new Error('Too many login attempts. Please try again in a minute.');
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user || !user.passwordHash) {
          throw new Error('Invalid email or password');
        }
        const isPasswordValid = await compare(credentials.password, user.passwordHash);
        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
    // Guest Login (unique account per session)
    CredentialsProvider({
      id: 'guest',
      name: 'Guest',
      credentials: {},
      async authorize() {
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const guestEmail = `${guestId}@mybillledger.guest`;
        const guestUser = await prisma.user.create({
          data: { email: guestEmail, name: 'Guest User', isGuest: true, passwordHash: null },
        });
        return { id: guestUser.id, email: guestUser.email, name: guestUser.name };
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        const existingUser = await prisma.user.findUnique({ where: { email: user.email } });
        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: { email: user.email, name: user.name || user.email.split('@')[0], image: user.image, passwordHash: null },
          });
          await prisma.account.create({
            data: { userId: newUser.id, type: account.type, provider: account.provider, providerAccountId: account.providerAccountId, access_token: account.access_token, refresh_token: account.refresh_token, expires_at: account.expires_at, token_type: account.token_type, scope: account.scope, id_token: account.id_token },
          });
          user.id = newUser.id;
        } else {
          const existingAccount = await prisma.account.findUnique({ where: { provider_providerAccountId: { provider: account.provider, providerAccountId: account.providerAccountId } } });
          if (!existingAccount) {
            await prisma.account.create({
              data: { userId: existingUser.id, type: account.type, provider: account.provider, providerAccountId: account.providerAccountId, access_token: account.access_token, refresh_token: account.refresh_token, expires_at: account.expires_at, token_type: account.token_type, scope: account.scope, id_token: account.id_token },
            });
          }
          user.id = existingUser.id;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.email = user.email; token.name = user.name; }
      return token;
    },
    async session({ session, token }) {
      if (token) { session.user.id = token.id; session.user.email = token.email; session.user.name = token.name; }
      return session;
    },
  },
  pages: { signIn: '/auth/login' },
  secret: process.env.NEXTAUTH_SECRET,
};
