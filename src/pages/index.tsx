import { GetServerSideProps } from 'next'

import Head from "next/head";
import styles from './home.module.scss'
import { SubscribeButton } from "../components/SubscribeButton";
import { stripe } from '../services/stripe';

interface HomeProps {
  product: {
    priceId: string,
    amount: number
  }
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head> {/* Posso colocar o Head do Next.js em qualquer lugar da tela */ }
        <title>Home | ig.news</title>
      </Head>
      
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>
            News about <br /> the <span>React</span> world
          </h1>
          <p>
            Get acess to all the publications <br />
            <span>for {product.amount} month</span>
          </p>
          <SubscribeButton priceId={product.priceId} />
        </section>
        <img src="/images/avatar.svg" alt="girl coding" />
      </main>
    </>
  );
}

/* Utilização de API para SSR (Server Side Rendering) */
export const getServerSideProps: GetServerSideProps = async () => {
  const price = await stripe.prices.retrieve('price_1NwrbKCJbeT9RxC7mVuIIEVW', {
    expand: ['product']
  })

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency
    }).format(price.unit_amount ? price.unit_amount / 100 : 0)
  }

  return {
    props: {
      product
    }    
  }
}
