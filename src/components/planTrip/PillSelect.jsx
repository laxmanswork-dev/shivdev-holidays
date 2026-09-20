import { cn } from '../../utils/cn';
import './PillSelect.css';

/**
 * A single-select group of pill buttons — real radio inputs under the
 * hood (one tab stop, arrow-key switching, correct screen-reader
 * announcement) styled as pills rather than a native radio row. Used
 * for Trip Type in the trip planner; deliberately a proper form
 * control, not a copy of the Destinations page's
 * underline-text CategoryFilter (that one filters a page of content —
 * this one IS the answer to a form question).
 *
 * @param {Object} props
 * @param {string} props.name
 * @param {string} props.label
 * @param {{id: string, label: string, description?: string}[]} props.options
 * @param {string} props.value
 * @param {(id: string) => void} props.onChange
 */
export function PillSelect({ name, label, options, value, onChange }) {
  return (
    <div className="pill-select">
      <span className="pill-select__label" id={`${name}-label`}>
        {label}
      </span>
      <div className="pill-select__options" role="radiogroup" aria-labelledby={`${name}-label`}>
        {options.map((option) => (
          <label
            key={option.id}
            className={cn('pill-select__option', value === option.id && 'pill-select__option--active')}
            title={option.description}
          >
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
