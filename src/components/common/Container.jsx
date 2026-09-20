import { cn } from '../../utils/cn';

/**
 * Layout primitive that applies the site's max-width and gutter.
 * @param {Object} props
 * @param {'sm'|'md'|'lg'|'xl'|'2xl'} [props.size]
 * @param {React.ElementType} [props.as]
 */
export function Container({ as: Tag = 'div', size, className, children, ...rest }) {
  return (
    <Tag
      className={cn(
        'container',
        size === 'sm' && 'container--narrow',
        size === '2xl' && 'container--wide',
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
