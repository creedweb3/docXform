'use client';

import clsx from 'clsx';

type RadioOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

type RadioGroupProps<T extends string> = {
  label?: string;
  name: string;
  value: T;
  options: RadioOption<T>[];
  onChange: (next: T) => void;
  className?: string;
};

export function RadioGroup<T extends string>({ label, name, value, options, onChange, className }: RadioGroupProps<T>) {
  return (
    <fieldset className={clsx('space-y-2', className)} aria-label={label}>
      {label && <legend className="text-sm font-semibold text-foreground">{label}</legend>}
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const inputId = `${name}-${option.value}`;
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className={clsx(
                'flex cursor-pointer items-start gap-3 rounded-xl border border-border/50 bg-card/50 px-3 py-2 text-sm transition focus-within:ring-2 focus-within:ring-ring hover:bg-card/70',
                checked && 'border-foreground/30 bg-card/80'
              )}
            >
              <input
                id={inputId}
                type="radio"
                name={name}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="mt-1 h-4 w-4 cursor-pointer accent-foreground"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-foreground">{option.label}</span>
                {option.description && (
                  <span className="block text-xs text-muted-foreground">{option.description}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
