import '../styles/Button.css'

/**
 * Reusable Button component with consistent styles and accessibility.
 *
 * @param {string}  variant   - 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'cyan'
 * @param {string}  size      - 'sm' | 'md' (default) | 'lg'
 * @param {boolean} fullWidth - stretch to container width
 * @param {string}  as        - 'button' (default) | 'a' — renders an anchor when needed
 * @param {string}  href      - used when as='a'
 * @param {*}       children
 */
export default function Button({
  variant = 'primary',
  size,
  fullWidth = false,
  as: Tag = 'button',
  href,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size === 'sm' ? 'btn-sm' : '',
    size === 'lg' ? 'btn-lg' : '',
    fullWidth ? 'btn-full' : '',
    className,
  ].filter(Boolean).join(' ')

  if (Tag === 'a') {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
