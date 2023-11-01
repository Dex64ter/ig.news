import { SignInButton } from '../SignInButton';
import styles from './styles.module.scss'
import Link from 'next/link';

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        {/* imagens ficam sempre na pasta public */}
        <img src="/images/logo.svg" alt="ig.news" />
        <nav>
          <Link href={'/'} className={styles.active}>Home</Link>
          <Link href={'/posts'}prefetch>Posts</Link>
        </nav>

        <SignInButton />
      </div>
    </header>
  );
}