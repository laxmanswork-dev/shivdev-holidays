import { Minus, Plus } from 'lucide-react';
import './TravellerStepper.css';

const MIN = 1;
const MAX = 12;

/**
 * Number of travellers — a large, touch-friendly +/- stepper rather
 * than a bare `<input type="number">`, whose tiny native spinners are
 * awkward to tap on a phone.
 *
 * @param {Object} props
 * @param {string} props.id
 * @param {number} props.value
 * @param {(value: number) => void} props.onChange
 */
export function TravellerStepper({ id, value, onChange }) {
  function clamp(next) {
    return Math.min(MAX, Math.max(MIN, next));
  }

  return (
    <div className="traveller-stepper">
      <label className="traveller-stepper__label" htmlFor={id}>
        Travellers
      </label>
      <div className="traveller-stepper__control">
        <button
          type="button"
          className="traveller-stepper__button"
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= MIN}
          aria-label="Fewer travellers"
        >
          <Minus size={16} aria-hidden="true" />
        </button>

        <input
          id={id}
          className="traveller-stepper__value"
          type="number"
          inputMode="numeric"
          min={MIN}
          max={MAX}
          value={value}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isInteger(next)) onChange(clamp(next));
          }}
          aria-label="Number of travellers"
        />

        <button
          type="button"
          className="traveller-stepper__button"
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= MAX}
          aria-label="More travellers"
        >
          <Plus size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
