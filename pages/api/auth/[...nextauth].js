import  GoogleProvider  from 'next-auth/providers/google';
import NextAuth from "next-auth/next";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from "../../../lib/mongodb"
import CredentialsProvider from "next-auth/providers/credentials"
import connectDB from "../../../config/connectDB";
import Users from '../../../models/userModel'
import bcrypt from 'bcrypt'
import nextAuth, { NextAuthOptions } from "next-auth";

const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],  
  pages: {
      signIn: "/src/user/login"
  },
}

export default nextAuth(authOptions)