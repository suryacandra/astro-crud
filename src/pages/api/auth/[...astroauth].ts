import AstroAuth from "@astro-auth/core";
import { GoogleProvider, CredentialProvider } from "@astro-auth/providers";
import { connectDb } from "../../../../lib/connectDb";
import bcrypt from "bcrypt";

export const all = AstroAuth({
  authProviders: [
    GoogleProvider({
      clientId: import.meta.env.GOOGLE_CLIENT_ID,
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
    }, 
    ),
    CredentialProvider({
      // Here, we are simply checking if the email matches and allow the user to login
      authorize: async (properties) => {
          const client = await connectDb();
          const db = await client.db('astro');
          const usersCollection = await db.collection("users");
          const userExists = await usersCollection.findOne({ email: properties.email });
          if(!userExists) {
            return null
          }
          const passwordMatch = await bcrypt.compare(properties.password, userExists.password);
          if(passwordMatch) {
            return userExists;
          } else {
            return null;
            
          }
      },
    }),
  ],
  hooks: {
    jwt: async (user) => {
      const client = await connectDb();
      const db = await client.db('astro');
      const usersCollection = await db.collection("users_google");
      const userExists = await usersCollection.findOne({ email: user.user.email });
      if(!userExists) {
        return {
            accessToken: user.user.accessToken,
            name: user.user.name,
            email: user.user.email,
            roles: 'user'
        }
      } else if(userExists) {
        return {
            accessToken: user.user.accessToken,
            ...userExists
        };
      }
    },
    signIn: async (user) => {
      const client = await connectDb();
      const db = await client.db('astro');
      const usersCollection = await db.collection("users_google");
      const userExists = await usersCollection.findOne({ email: user.user.email });
      if (!client) {
        return false
      } else if(!userExists) {
        await usersCollection.insertOne({
          name: user.user.name, email: user.user.email, role: 'user'
        });
        return true
      } else if(userExists) {
        return true
      }
    },
    redirectError: async (error) => {
      console.log(error);
      return "/";
    },
  }
});
