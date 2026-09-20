import { cn } from '../../utils/cn';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll';
import { Container } from './Container';
import './Section.css';

/**
 * The one wrapper every homepage section (and most page sections)
 * should use. Controls background, viewport height, the divider
 * between sections, and the internal vertical rhythm — so none of
 * that is hand-rolled per section.
 *
 * Structure rendered: `.section` > Container (`.container`, the
 * width-constrained "inner") > `.section__content` (the actual
 * flex/vertical-rhythm wrapper your children land in).
 *
 * `.section__content` also fades + rises into view the first time it
 * scrolls into the viewport (see useRevealOnScroll / Section.css) —
 * automatic for every section using this component, no prop needed.
 *
 * @param {Object} props
 * @param {React.ElementType} [props.as]
 * @param {'default'|'alt'|'surface'|'dark'|'ice'|'ice-alt'} [props.background] - the
 *   section's canvas: 'default' (ice blue — the site's primary identity),
 *   'alt' (a slightly deeper "soft ice" tone, for rhythm), 'surface'
 *   (white — a full white content-surface section, as opposed to a white
 *   card sitting on the ice-blue canvas), 'dark' (deep ocean — the footer
 *   and a closing CTA; the only variant that gets inverse white-family
 *   type automatically), 'ice' (the non-homepage page canvas — a very
 *   light near-white ice blue), 'ice-alt' (a slightly deeper ice-blue
 *   beat for alternating sections on non-homepage pages). Cycle through
 *   these rather than repeating one tone, but keep transitions subtle —
 *   this is one calm environment.
 * @param {'none'|'compact'|'default'|'spacious'} [props.spacing] - padding for a normal (non-viewport) section
 * @param {'auto'|'full'|'hero'} [props.viewport] - 'full': ~one viewport tall.
 *   'hero': one viewport tall *including* the sticky header above it
 *   (min-height: calc(100svh - header height)) — use for the very
 *   first section only. 'auto' (default): natural height.
 * @param {boolean} [props.divider] - subtle 1px bottom border marking the page boundary
 * @param {'start'|'center'|'end'|'between'} [props.align] - vertical placement of
 *   the content GROUP within the section (only visible when the section is taller
 *   than its content) — defaults to 'center' so a viewport section is vertically
 *   balanced by default. The group moves as one block; individual children are
 *   never centered independently.
 * @param {'left'|'right'|'center'} [props.horizontal] - horizontal placement of
 *   the content block. Independent of `align`: a 'left' section (the default)
 *   keeps left-aligned text while still being vertically centered.
 * @param {boolean} [props.container] - set false to lay out children directly
 * @param {'sm'|'md'|'lg'|'xl'|'2xl'} [props.containerSize]
 * @param {string} [props.ariaLabel]
 * @param {string} [props.contentClassName] - extra class on `.section__content`
 * @param {React.ReactNode} [props.media] - rendered as a direct child of the
 *   section, BEFORE the Container — i.e. a sibling of the width-constrained
 *   content, not nested inside it. For full-bleed background media (e.g.
 *   HeroVideo) that must fill the whole section, not just the measure-capped
 *   content column. `.section` is already `position: relative`, so
 *   `position: absolute; inset: 0` on this content fills it correctly.
 */
export function Section({
  as: Tag = 'section',
  background = 'default',
  spacing = 'default',
  viewport = 'auto',
  divider = false,
  align = 'center',
  horizontal = 'left',
  container = true,
  containerSize,
  id,
  ariaLabel,
  className,
  contentClassName,
  media,
  children,
  ...rest
}) {
  const isViewportSection = viewport !== 'auto';
  const { ref: revealRef, revealed } = useRevealOnScroll();

  const content = (
    <div
      ref={revealRef}
      className={cn(
        'section__content',
        `section__content--align-${align}`,
        `section__content--h-${horizontal}`,
        revealed && 'section__content--revealed',
        contentClassName
      )}
    >
      {children}
    </div>
  );

  return (
    <Tag
      id={id}
      aria-label={ariaLabel}
      className={cn(
        'section',
        `section--bg-${background}`,
        !isViewportSection && spacing !== 'default' && `section--spacing-${spacing}`,
        isViewportSection && `section--viewport-${viewport}`,
        divider && 'section--divider',
        media && 'section--has-media',
        className
      )}
      {...rest}
    >
      {media}
      {container ? <Container size={containerSize}>{content}</Container> : content}
    </Tag>
  );
}
