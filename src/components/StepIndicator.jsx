import styles from './StepIndicator.module.css'

export default function StepIndicator({ current, total }) {
  return <div className={styles.step}>Stap {current} van {total}</div>
}
