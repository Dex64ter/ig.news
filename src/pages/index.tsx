import Head from "next/head";
import styles from './home.module.scss'

export default function Home() {
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
            <span>for $9,90 month</span>
          </p>
        </section>
        <img src="/images/avatar.svg" alt="girl coding" />
      </main>
    </>
  );
}
