# Ignews

## WebHooks do Stripe
  O que são WebHooks? WebHooks são patterns muito utilizado para integração entre sistemas na web.

Eles ajudam a avisar a aplicação sobre algo na aplicação terceira.

Como por exemplo:
  > - O Stripe não consegue receber o pagamento pois a forma de pagamento está sem fundo, ou sem limite.
  > - O Stripe deve usar um WebHook para avisar a nossa aplicação de que o usuário específico não pode continuar com a sua subscrição, então a aplicação deve fazer algo com essa informação

O Stripe por padrão tem como configurar seus Webhooks.

![Imagem do dashboard do Stripe da página de configuração dos Webhooks](./imgs/image.png)

Como estamos em um ambiente de produção, seguimos com a descrição do stribe na área de teste em ambiente local. Caso a aplicação já esteja em produção, podemos adicionar um endpoint que nos dá acesso ao cadastro do link da nossa aplicação em produção.

O link para acesso da configuração do webhook do stripe de teste em ambiente local está neste [link](https://dashboard.stripe.com/test/webhooks/create?endpoint_location=local)

Dependendo do sistemas operacional, seguimos com a instalação do CLI do stripe para reconhecimento dos webhooks

Após a configuração da variável de ambiente _stripe_ vamos para as instruções descritas no stripe.

- Acessamos nosso login do stripe com o comando ```stripe login```

  ![Comandos do stripe](./imgs/image2.png)

- Em seguida entraremos com o comando ```stripe listen --forward-to localhost:1231/webhooks``` com o final o caminho da nossa aplicação que receberá os webhooks do stripe

- Criamos o arquivo que receberá os webhooks, 
```typescript
import { NextApiRequest, NextApiRequest } from "next"

export default (req: NextApiRequest, res: NextApiResponse) => {
  console.log('evento recebido')

  return res.status(200).json({ ok: true })
}
```

Deixando o prompt do stripe executando teremos diversas novas requisições vindas do stripe.

![Webhooks sendo enviados](./imgs/image3.png)

## Ouvindo eventos do Stripe

Para ouvir os eventos do stripe pouco a pouco, importamos o Readable da lib stream, ele nos ajuda a ler as requisições pouco a pouco, pedaço por pedaço de uma stream. Para isso funcionar usamos um código pronto:

```typescript
import { Readable } from "stream"

async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === "string" ? Buffer.from(chunk) : chunk
    )
  }
  
  return Buffer.concat(chunks);
}
```

Utilizando a função acima na nossa default function, poderemos acessar os webhooks a partir da requisção recebida.

Para que as requisições sejam legíveis para o next, na sua própria documentação, temos opções de configurar a maneira como ele lê as requisições, pois por padrão o Next faz a leitura de requisições como formulários json. Dessa forma, utilizaremos o _custom config_ para modificar a leitura padrão do Next para fazer a leitura de uma Stream.

```typescript
export const config = {
  api: {
    bodyParser: false
  }
}

const handlerWebhook = async (req: NextApiRequest, res: NextApiResponse) => {
  const buf = await buffer(req);

  res.json({ received: true }) 
}

export default handlerWebhook;

```

Os webhooks quando criados por terceiros, enviam um código próprio para enviar os eventos de maneira mais segura, porque assim como as outras rotas, o recebimento dos eventos são feitos por uma rota e qualquer um com conhecimento sobre ela poderia fazer esse acesso.

Com o webhook criado então, ele envia uma chave de acesso dentro do terminal visto anteriormente e ele será nossa chave de acesso como uma variável local de ambiente.

Para facilitar a identificação de eventos úteis para nossa aplicação, implementamos um conjunto com somente os eventos que desejamos na aplicação que provem do Stripe. A partir disso, "filtramos" os eventos das requisições com somente aqueles que desejamos.

```typescript
const relevantEvents = new Set([
  'checkout.session.completed'
])

const handlerWebhook = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST'){
    const buf = await buffer(req);
    const secret = req.headers['stripe-signature']

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err){
      return res.status(400).send(`Webhook error: ${err}`)
    }

    const { type } = event;

    if (relevantEvents.has(type)) {
      console.log('evento recebido', event)
    }

    res.json({ received: true })
  } else {
    res.setHeader("Allow", 'POST');
    res.status(405).end('Method Not Allowed');
  }

}
```

Nessa implementação, eu consigo verificar se o método da requisição é POST. Consigo verificar o evento da forma como é descrito na documentação do Stripe e condicionar para verificar se o evento desejado está na requisição recebida e assim enviar a confirmação com "Evento recebido" e a descrição do evento.

Caso dê errado, é enviado um status de erro.

## Salvando dados do evento

Para designar determinadas funções para cadaa tipo de evento desejado pela nossa aplicação, como por exemplo, inscrição de um usuário, pagamento não efetuado, cancelamento de assinatura, entre outros eventos, modificamos o condicional de verificação de que os determinados eventos estão presentes no webhook e colocamos uma estrutura _switch(type)_ para levar os eventos a suas determinadas funções.

```typescript
const handlerWebhook = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST'){
    const buf = await buffer(req);
    const secret = req.headers['stripe-signature']

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, secret!, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err){
      return res.status(400).send(`Webhook error: ${err}`)
    }

    const { type } = event;

    if (relevantEvents.has(type)) {
      try {
        switch(type) {
          case 'checkout.session.completed':
            const checkoutSession = event.data.object as Stripe.Checkout.Session
            await saveSubsccription(
              checkoutSession.subscription?.toString(),
              checkoutSession.customer?.toString()
            )
            break;
          default:
            throw new Error('Unhandled event.')
        }
      } catch (err) {
        return res.json({ error: 'Webhook handler failed.'})
      }

    }

    res.json({ received: true })
  } else {
    res.setHeader("Allow", 'POST');
    res.status(405).end('Method Not Allowed');
  }

}
```

No caso do evento exemplo feito acima, verificamos quando um usuário efetua a sua inscrição na newsletter Ignews. A partir disso é feito um chamado para uma função criada em uma outra pasta dentro da pasta api ficando desta forma:

```
../api/_lib/manageSubscription.ts
```

Foi colocado o underline "_" antes do nome da pasta para não ser tratada como uma rota da aplicação. A aplicação em si ignora essa pasta por não designar uma rota dela podendo ser colocada tanto dentro da pasta api como na pasta pages, ela não é reconhecida.

Logo, dentro deste arquivo temos o seguinte código:

```typescript
import { query as q } from "faunadb"
import { fauna } from "../../../services/fauna"
import { stripe } from "@/src/services/stripe"

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

  // Salvar os dados da subscription do usuário no FaunaDB
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
}
```

Cabe citar que o código descrito acima, só funcionará após a criação de uma nova collection para guardar novos dados da nossa aplicação, as inscrições. Deverão ser criadas a collection ___subscriptions___ e um novo indexador na collection ___users___ com o nome de _user_by_stripe_customer_id_

Agora ao código:
- Primeiro iremos buscar o usuário cadastrado no Fauna que fez a incrição e selecionar a sua referência que posteriormente utilizaremos para guardar como dado da inscrição.

- Em seguida, buscamos o dado da subscrição do usuário no stripe.

- Em fim, utilizamos o objeto "subscriptionData" para formatar os dados da subscrição e assim salvar esse objeto dentro do banco do Fauna na collection subscriptions.