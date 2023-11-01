import { GetStaticProps } from 'next';
import styles from './styles.module.scss';
import Head from 'next/head';
import { getPrismicClient } from '@/src/services/prismic';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;

}
interface PostsProps {
  posts: Post[],
}

export default function Posts({ posts }: PostsProps){
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>

          {
            posts.map(post => (
              <a key={post.slug} href="">
                <time>{post.updatedAt}</time>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
              </a>
            ))
          }
          
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
  const posts = response.results.map(post => {
    // pequena modificação por causa do typescript para não
    // ocasionar o erro de dados unknown por conta da tipagem
    type Post = {
      data: {
        title: string;
        content: {
          type: string;
          text: string;
      }[];
      };
    }
    const postData = post.data as Post['data'];
    // a partir daqui sabemos o tipo dos dados do objeto post
    // e podemos acessar as propriedades sem problemas

    return {
      slug: post.uid,
      title: RichText.asText(postData.title),
      excerpt: (postData.content.find((content) => content.type === 'paragraph')?.text ?? ''),
      updatedAt: new Date(post.last_publication_date!).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    };
  })

  return {
    props: {
      posts
    }
  }
}