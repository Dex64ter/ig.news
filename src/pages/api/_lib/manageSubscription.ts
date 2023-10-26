import { query as q } from "faunadb"
import { fauna } from "../../../services/fauna"
import { stripe } from "../../../services/stripe"

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createAction = false
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

  if(createAction) {
    await fauna.query(
      q.Create(
        q.Collection('subscriptions'),
        { data: subscriptionData }
      )  
    )
  } else {
    await fauna.query(
      // para atualizar Update ou Replace
      // com o Update eu consigo mudar um dos campos dentro de um registro do Fauna
      // com o Replace eu substituo toda a informação do registro, toda a subscription
      q.Replace(
        q.Select(
          "ref",
          q.Get(
            q.Match(
              q.Index("subscription_by_id"),
              subscriptionId,
            )
          )
        ),
          { data: subscriptionData }
      )
    )    
  }
  // Salvar os dados da subscription do usuário no FaunaDB
}
