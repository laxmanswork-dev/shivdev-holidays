import { cn } from '../../utils/cn';
import './CategoryFilter.css';

/**
 * Minimal category filter — plain text chips, not a big pill wall.
 * A group of ordinary toggle buttons (each its own tab stop, state
 * conveyed via aria-pressed) rather than a full ARIA radiogroup
 * widget, which would need roving-tabindex + arrow-key handling to
 * be correct — Tab-through-each-chip is simpler and just as usable.
 *
 * @param {Object} props
 * @param {{id: string, label: string}[]} props.filters
 * @param {string} props.active
 * @param {(id: string) => void} props.onChange
 */
export function CategoryFilter({ filters, active, onChange }) {
  return (
    <div className="category-filter" role="group" aria-label="Filter destinations">
      {filters.map((filter) => (
        <button
          key={filter.id}
          type="button"
          aria-pressed={active === filter.id}
          className={cn('category-filter__chip', active === filter.id && 'category-filter__chip--active')}
          onClick={() => onChange(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
