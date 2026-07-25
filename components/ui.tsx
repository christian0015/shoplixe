// components/ui.tsx
'use client';

import { InputHTMLAttributes, SelectHTMLAttributes, ButtonHTMLAttributes, forwardRef } from 'react';

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// --- Button ---
// primary = actions de conversion (vert, comme le CTA de la landing)
// secondary = actions neutres (noir stone-900)
// ghost = actions discrètes / annuler
// danger = actions destructrices
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-[#2e5e4d] text-white hover:bg-[#518c76] shadow-sm shadow-[#5ac9a2]/20',
  secondary: 'bg-stone-900 text-stone-100 hover:bg-stone-800',
  ghost: 'bg-transparent border border-stone-300 text-stone-700 hover:bg-stone-100 hover:border-stone-400',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-5 py-2.5 rounded-full font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        buttonVariants[variant],
        className
      )}
      {...props}
    />
  );
}

// --- Input ---
type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, className, id, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-stone-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-sm text-stone-900 placeholder-stone-400 outline-none focus:ring-2 focus:ring-[#2e5e4d]/25 focus:border-[#2e5e4d] transition disabled:bg-stone-50 disabled:text-stone-400',
          className
        )}
        {...props}
      />
    </div>
  );
});

// --- Select ---
type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label?: string };

export function Select({ label, className, id, children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-stone-700">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          'w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-sm text-stone-900 outline-none focus:ring-2 focus:ring-[#2e5e4d]/25 focus:border-[#2e5e4d] transition',
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

// --- Badge ---
// promo/accent garde l'orange de la marque (prix, mise en avant) ;
// le reste reste neutre pour ne pas diluer l'accent.
type BadgeVariant = 'default' | 'verified' | 'promo' | 'sold-out';

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-stone-100 text-stone-600',
  verified: 'bg-[#2e5e4d]/10 text-[#2e5e4d]',
  promo: 'bg-orange/15 text-orange',
  'sold-out': 'bg-stone-900/85 text-white',
};

export function Badge({
  variant = 'default',
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// --- Toggle ---
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors',
          checked ? 'bg-[#2e5e4d]' : 'bg-stone-300'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
            checked && 'translate-x-5'
          )}
        />
      </button>
      {label && <span className="text-sm text-stone-700">{label}</span>}
    </label>
  );
}