import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";
import { JWT, DefaultJWT } from "next-auth/jwt";

// Extend NextAuth types
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        } & DefaultSession["user"];
    }
    interface User extends DefaultUser {
        id: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id: string;
    }
}

// Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
);

// Helper: Get or create user in Supabase
async function getOrCreateUser(email: string, name: string, googleId: string, image: string = '') {
    // Try to find existing user
    let { data: user, error: findError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    if (findError && findError.code !== 'PGRST116') {
        console.error('Find user error:', findError);
    }

    // Create user if doesn't exist
    if (!user) {
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
                email,
                name,
                google_id: googleId,
                avatar_url: image,
                created_at: new Date().toISOString()
            })
            .select('id')
            .single();

        if (insertError) {
            console.error('Insert user error:', insertError);
            return null;
        }

        user = newUser;
        console.log('Created new user:', user.id, email);
    }

    return user;
}

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google" && profile) {
                const email = user.email || '';
                const name = user.name || '';
                const googleId = account.providerAccountId;
                const image = user.image ?? undefined;

                // Get or create user in Supabase
                const dbUser = await getOrCreateUser(email, name, googleId, image || '');
                
                if (!dbUser) {
                    console.error('Failed to create user in database');
                    return false;
                }

                // Store user ID in session
                user.id = dbUser.id;
            }
            return true;
        },
        async session({ session, token }) {
            // Add user ID to session
            if (session.user) {
                session.user.id = token.sub as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        }
    },
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout'
    },
    session: {
        strategy: "jwt"
    }
});

export { handler as GET, handler as POST };
