import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react"
import { stripe } from "../../services/stripe";
import { query as q } from 'faunadb';
import { fauna } from "../../services/fauna";

type User = {
  ref: {
    id: string;
  }
  data: {
    stripe_customer_id: string;
  }
}
export default async function subscribe(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {

    const session = await getSession({ req }) // recupera os dados do usuário
    
    // console.log(session)
    // Buscar o usuário no faunaDB com o id {session.user.email}
    const user = await fauna.query<User>(
      q.Get(
        q.Match(
          q.Index('user_by_email'),
          q.Casefold(session.user?.email)
        )
      )
    )

    // Verificar se o usuário já possui um customer_id
    let customerId = user.data.stripe_customer_id;

    // Se não possuir, criar um customer no stripe
    if (!customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: session?.user?.email,
        // metadata
      })
      
      await fauna.query(
        q.Update(
          q.Ref(q.Collection('users'), user.ref.id),
          {
            data: {
              stripe_customer_id: stripeCustomer.id,
            }
          }
  
        )
      )

      customerId = stripeCustomer.id;
    }


    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId, // id do usuário
      payment_method_types: ["card"], // tipo de pagamento
      billing_address_collection: "required",  // obriga o usuário a preencher o endereço
      line_items: [ // itens que serão cobrados
        { price: "price_1NwrbKCJbeT9RxC7mVuIIEVW", quantity: 1 }
      ],
      mode: "subscription", // tipo de pagamento
      allow_promotion_codes: true, // permite o uso de códigos promocionais
      success_url: process.env.STRIPE_SUCCESS_URL!, // url de sucesso
      cancel_url: process.env.STRIPE_CANCEL_URL // url de cancelamento
      
    })
    return res.status(200).json({ sessionId: stripeCheckoutSession.id })
  } else {
    res.setHeader("Allow", 'POST');
    res.status(405).end('Method Not Allowed');
  }
}