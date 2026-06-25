import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary py-4 select-none" aria-label="Breadcrumb">
      {/* Root Home link */}
      <Link to="/" className="flex items-center gap-1 hover:text-primary transition-smooth">
        <Home className="h-3.5 w-3.5" />
        <span>Home</span>
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={idx} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-text-muted shrink-0" />
            {isLast || !item.url ? (
              <span className="text-text-primary font-bold truncate max-w-[160px] sm:max-w-xs" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link to={item.url} className="hover:text-primary transition-smooth truncate max-w-[120px] sm:max-w-[200px]">
                {item.name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
export { Breadcrumb };
