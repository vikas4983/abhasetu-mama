import { ButtonHTMLAttributes, memo, PropsWithChildren } from 'react';

type AppButtonVariant = 'primary' | 'ghost' | 'hero';

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AppButtonVariant;
}

export const AppButton = memo(function AppButton({
  variant = 'primary',
  className = '',
  children,
  ...props
}: PropsWithChildren<AppButtonProps>) {
  const variantClass = variant === 'primary' ? 'primary-action' : variant === 'hero' ? 'hero-btn' : 'back-link';
  return (
    <button className={`${variantClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
});
