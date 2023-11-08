import { getPrismicClient } from "../../../services/prismic";
import {  GetStaticProps } from "next";
import Head from "next/head";
import { RichText } from "prismic-dom";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";

import styles from '../post.module.scss';

interface PostPreviewProps {
  post: {
    slug: string,
    title: string,
    content: string,
    updatedAt: string,
  }
}

export default function PostPreview({ post }: PostPreviewProps) {
  const {data: session} = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.activeSubscription) {
      router.push(`/posts/${post.slug}`);
    }
  }, [session]);

  return (
    <>
      <Head>
        <title>{post.title} | Ignews</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="">
              Subscribe now! 🤗
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params as { slug: string };

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', String(slug), {});

  type Response = {
    data: {
      title: string;
      content: {
        type: string;
        text: string;
      }[];
    };
  }

  const res = response as Response;

  const post = {
    slug,
    title: RichText.asText(res.data.title),
    content: RichText.asHtml(res.data.content.splice(0, 3)),
    updatedAt: new Date(response.last_publication_date!).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }
  return {
    props: {
      post
    },
    revalidate: 60 * 30 // 30 minutes
  }
}