import styles from './Label.module.css'

export default function Label({ children }) {
  return <span className={styles.label}>{children}</span>
}
