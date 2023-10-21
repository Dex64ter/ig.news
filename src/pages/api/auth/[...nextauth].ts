import { query as q } from "faunadb";

import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { fauna } from "../../../services/fauna";

interface User {
  id: string;
  email: string;
}

export const AuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      // scope: "read:user",
    }),
  ],
  
  callback: {
    async signIn({ user }: { user: User }) {
      const { email } = user;
      // Try catch para verificar se é possível guardar o usuário no fauna
      try {
        await fauna.query( // Criando usuário no fauna 
          q.If(
            q.Not(
              q.Exists(
                q.Match(
                  q.Index("user_by_email"), // acessando o index user_by_email
                  q.Casefold(user.email)
                )
              )
            ),
            q.Create(
              q.Collection("users"), // acessando a collection users
              { data: { email } } // passando os dados do usuário
            ),
            q.Get(
              q.Match(
                q.Index("user_by_email"), // acessando o index user_by_email
                q.Casefold(user.email)
              )
            )
          )
        );
        return true;
      } catch {
        return false;
      }
    },
  },
};

export default NextAuth(AuthOptions);
