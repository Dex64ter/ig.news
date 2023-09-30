import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head> {/* Posso colocar o Head do Next.js em qualquer lugar da tela */ }
        <title>Home | ig.news</title>
      </Head>
      
      <h1>
        Hello <span>World</span>
      </h1>
    </>
  );
}
