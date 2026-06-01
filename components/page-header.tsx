import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  align?: 'center' | 'left';
  className?: string;
};

export function PageHeader({
  title,
  description,
  eyebrow,
  align = 'center',
  className,
}: PageHeaderProps) {
  const centered = align === 'center';

  return (
    <header
      className={cn(
        'mb-12 sm:mb-14',
        centered && 'text-center',
        className
      )}
    >
      {eyebrow ? <p className="section-eyebrow mb-5">{eyebrow}</p> : null}
      <h1
        className={cn(
          'font-display text-3xl sm:text-5xl font-bold tracking-tight text-foreground text-balance',
          centered && 'mx-auto max-w-3xl'
        )}
      >
        {title}
      </h1>
      <div className={cn('section-divider my-5', centered && 'mx-auto')} />
      {description ? (
        <p
          className={cn(
            'text-sm sm:text-base text-muted-foreground leading-relaxed',
            centered && 'mx-auto max-w-2xl'
          )}
        >
          {description}
        </p>
      ) : null}
    </header>
  );
}
