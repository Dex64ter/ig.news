import { query as q } from "faunadb";
import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { fauna } from "../../../services/fauna";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user"
        }
      }
    }),
  ],
  callbacks: {
    async session({ session }) {
      try {
        const userActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index("subscription_by_user_ref"), // acessando o index subscription_by_user_ref
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index("user_by_email"),
                      q.Casefold(session.user?.email ?? "") // providing a default value for email
                    )
                  )
                )
              ),
              q.Match(
                q.Index("subscription_by_status"), // acessando o index subscription_by_status
                q.Casefold("active")
              )
            ])
          )
        )

        return {
          ...session,
          activeSubscription: userActiveSubscription
        };
      } catch {
        
        return {
          ...session,
          activeSubscription: null
        };
      }
    },

    async signIn({ user, account, profile }) {
      const { email } = user;
      
      // Try catch para verificar se é possível guardar o usuário no fauna
      try {
        await fauna.query( // Criando usuário no fauna 
          q.If(
            q.Not(
              q.Exists(
                q.Match(
                  q.Index("user_by_email"), // acessando o index user_by_email
                  q.Casefold(user.email!)
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
                q.Casefold(user.email!)
              )
            )
          )
        );
        return true;
      } catch {
        return false;
      }
    },
    
  }

};

export default NextAuth(authOptions);
