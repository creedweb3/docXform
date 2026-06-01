import Link from 'next/link';
import { Card } from '@/components/site/ui/card';

type ArticleDetailCtaCardProps = {
  title: string;
  body: string;
  href: string;
  linkLabel: string;
};

export function ArticleDetailCtaCard({ title, body, href, linkLabel }: ArticleDetailCtaCardProps) {
  return (
    <Card padding="lg" className="mt-10">
      <h2 className="mb-2 text-base font-semibold text-foreground">{title}</h2>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{body}</p>
      <Link
        href={href}
        className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground"
      >
        {linkLabel}
      </Link>
    </Card>
  );
}
