import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react"
import { stripe } from "@/src/services/stripe";


export default async function subscribe(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {

    const session = await getSession({ req }) // recupera os dados do usuário

    const stripeCustomer = await stripe.customers.create({
      email: session?.user?.email!,
      // metadata
    })

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id, // id do usuário
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