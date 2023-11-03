import ActiveLink from '../ActiveLink';
import { SignInButton } from '../SignInButton';
import styles from './styles.module.scss'
import Image from 'next/image';

export function Header() {

  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        {/* imagens ficam sempre na pasta public */}
        <Image src="/images/logo.svg" alt="ig.news" width={110} height={31}/>
        <nav>
          <ActiveLink activeClassName={styles.active} href={'/'}>
            <>
              Home
            </>
          </ActiveLink>
          <ActiveLink activeClassName={styles.active} href={'/posts'}  prefetch >
            <>
              Posts
            </>
          </ActiveLink>
        </nav>

        <SignInButton />
      </div>
    </header>
  );
}