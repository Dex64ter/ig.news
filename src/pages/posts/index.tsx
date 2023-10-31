import { GetStaticProps } from 'next';
import styles from './styles.module.scss';
import Head from 'next/head';
import { getPrismicClient } from '@/src/services/prismic';
import Prismic from '@prismicio/client';

export default function Posts(){
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          <a href="">
            <time>12 de março de 2023</time>
            <strong>Creating a new project in ReactJS</strong>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse quae ipsum expedita dolores aut, libero a obcaecati voluptatum, id tempore ea eligendi?</p>
          </a>
          <a href="">
            <time>12 de março de 2023</time>
            <strong>Creating a new project in ReactJS</strong>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse quae ipsum expedita dolores aut, libero a obcaecati voluptatum, id tempore ea eligendi?</p>
          </a>
          <a href="">
            <time>12 de março de 2023</time>
            <strong>Creating a new project in ReactJS</strong>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse quae ipsum expedita dolores aut, libero a obcaecati voluptatum, id tempore ea eligendi?</p>
          </a>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query(
    [
      Prismic.predicates.at('document.type', 'post')
    ],
    {
      fetch: ['publication.title', 'publication.content'],
      pageSize: 100,
    }
  )
    // como debugar com console.log()
    // Recomendado usar o response.stringfy
  console.log(JSON.stringify(response, null, 2))
  

  return {
    props: {
      response
    }
  }
}