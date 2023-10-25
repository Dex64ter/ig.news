import { query as q } from "faunadb"
import { fauna } from "../../../services/fauna"
import { stripe } from "../../../services/stripe"

export async function saveSubsccription(
  subscriptionId: string,
  customerId: string,
) {
  // Buscar usuário no Fauna com o customerId
  const userRef = await fauna.query(
    q.Select( // Selecionar um campo específico do retorno da query (no caso, o ref)
      "ref",
      q.Get(
        q.Match(
          q.Index("user_by_stripe_customer_id"),
          customerId
        )
      )
    )
  )

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const subscriptionData = {
    id: subscription.id,
    userId: userRef,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
  }

  await fauna.query(
    q.Create(
      q.Collection('subscriptions'),
      { data: subscriptionData }
    )  
  )
  // Salvar os dados da subscription do usuário no FaunaDB
}
