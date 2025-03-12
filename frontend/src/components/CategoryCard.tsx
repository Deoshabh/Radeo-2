import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface CategoryCardProps {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  id, 
  name, 
  imageUrl, 
  description 
}) => {
  return (
    <Link
      href={`/categories/${id}`}
      className="relative block h-64 rounded-lg overflow-hidden group"
    >
      <Image
        src={imageUrl}
        alt={name}
        layout="fill"
        objectFit="cover"
        className="transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-2xl font-bold text-white">{name}</h3>
        {description && (
          <p className="text-white text-sm mt-1 opacity-80">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
};

export default CategoryCard; 