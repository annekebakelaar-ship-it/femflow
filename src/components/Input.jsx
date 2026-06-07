import styles from './Input.module.css'

export default function Input({ label, textarea, ...props }) {
  const Tag = textarea ? 'textarea' : 'input'
  return (
    <div className={styles.wrapper}>
      {label && <label style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)' }}>{label}</label>}
      <Tag className={textarea ? styles.textarea : styles.input} {...props} />
    </div>
  )
}
