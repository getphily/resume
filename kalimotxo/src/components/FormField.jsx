import { useId } from 'react'
import styles from './FormField.module.css'

/**
 * Accessible form field with persistent visible label.
 * Associates <label> with input via ID, supports error messages.
 */
export default function FormField({
  label,
  type = 'text',
  error,
  hint,
  required = false,
  ...inputProps
}) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId  = `${id}-hint`

  const describedBy = [
    hint  ? hintId  : null,
    error ? errorId : null,
  ].filter(Boolean).join(' ') || undefined

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true"> *</span>
        )}
      </label>

      {hint && (
        <span id={hintId} className={styles.hint}>{hint}</span>
      )}

      <input
        id={id}
        type={type}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        {...inputProps}
      />

      {error && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
