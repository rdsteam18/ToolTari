import { Link } from 'react-router-dom';
import Card from './Card';

interface CategoryCardProps {
  slug: string;
  name: string;
  description: string;
  icon: string;
}

export default function CategoryCard({ slug, name, description, icon }: CategoryCardProps) {
  return (
    <Link to={`/${slug}`} className="block h-full group">
      <Card className="h-full flex flex-col items-start gap-4">
        <div className="p-3 bg-primary/10 text-primary rounded-md group-hover:bg-primary group-hover:text-white transition-smooth">
          <i className={`fas ${icon} text-lg w-5 h-5 flex items-center justify-center`}></i>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-lg text-text-primary group-hover:text-primary transition-smooth">
            {name}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {description}
          </p>
        </div>
      </Card>
    </Link>
  );
}
