import styles from './styles.module.scss'

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>

        {/* imagens ficam sempre na pasta public */}
        <img src="/images/logo.svg" alt="ig.news" />
        <nav>
          <a className={styles.active} >Home</a>
          <a >Posts</a>
        </nav>
      </div>
    </header>
  )
}