import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/app/api/lib/prismaClient";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Credentials received:", credentials);

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid email or password");
        }

        // Find user in the database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("User not found");
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        // ✅ Return user object (NOT an API response)
        return {
          id: user.user_id,
          name: user.name,
          email: user.email,
          createdAt: user.created_at,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.createdAt = user.createdAt;
      } else {
        // Fetch latest user data from DB on session refresh
        const dbUser = await prisma.user.findUnique({
          where: { user_id : token.id },
        });
        
        if (dbUser) {
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.createdAt = dbUser.created_at;
        }
      }
      return token;
    },
    async session({ session, token }) {
      
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.createdAt = token.createdAt;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
