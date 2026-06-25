import { Link } from 'react-router-dom';
import Card from './Card';
import { ArrowRight } from 'lucide-react';

interface ToolCardProps {
  slug: string;
  name: string;
  description: string;
  icon: string;
  popularity?: number;
}

export default function ToolCard({ slug, name, description, icon }: ToolCardProps) {
  return (
    <Link to={slug} className="block h-full group">
      <Card className="h-full flex flex-col justify-between gap-4">
        <div className="flex flex-col items-start gap-4">
          <div className="p-3 bg-bg-base border border-border-base text-primary rounded-md group-hover:border-primary/40 group-hover:bg-primary/5 transition-smooth">
            <i className={`fas ${icon} text-lg w-5 h-5 flex items-center justify-center`}></i>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-base text-text-primary group-hover:text-primary transition-smooth">
              {name}
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform duration-200 mt-2 select-none">
          Use Tool <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </Card>
    </Link>
  );
}
