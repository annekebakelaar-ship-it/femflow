import styles from './Button.module.css'

export default function Button({ children, disabled, onClick, type = 'button' }) {
  return (
    <button
      className={styles.button}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  )
}
