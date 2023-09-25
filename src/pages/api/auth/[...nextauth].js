import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import supabase from '../../../lib/supabaseClient'
import { validateUser } from "../../../utils/validateUser"

export const authOptions = {

  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      async authorize(credentials, req) {
        const { email, password } = credentials
        const user = await validateUser(email, password)
        if (user.data && user.data.length > 0) {
          return user.data[0]
        } else if (user.data && user.data.length === 0) {
          throw new Error('Account does not exist. Try again')
        } else if (!user.data) {
          throw new Error('Something went wrong')
        }
      }
    })
],

    session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {

    async jwt({ token, user }) {  // Pass USER ID to TOKEN UID
      if (user) {
        token.id = user.id; // ATTENTION: when playing with TOKEN logout and login to see changes
      }
      return token
    },

    async session({ session, token, user}) { // Here you need token to get USER ID through TOKEN UID
      if (session?.user) {
        session.user.id = token.id
      }
      return session
    }
  },

  pages: {
    signIn: '/signin',
    signOut: '/',
    error: '/signin'
  }
}

export default NextAuth(authOptions)