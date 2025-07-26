'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FadeIn, FadeInStagger } from '@/components/FadeIn';
import clsx from 'clsx';

interface Tag {
  tag: string;
  count: number;
}

interface TagFilterProps {
  tags: Tag[];
  className?: string;
  showAllButton?: boolean;
  onTagSelect?: (tag: string | null) => void;
}

export function TagFilter({ 
  tags, 
  className, 
  showAllButton = true, 
  onTagSelect 
}: TagFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedTag = searchParams.get('tag');

  const handleTagClick = (tag: string | null) => {
    const params = new URLSearchParams(searchParams);
    
    if (tag) {
      params.set('tag', tag);
    } else {
      params.delete('tag');
    }
    
    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newUrl);
    
    if (onTagSelect) {
      onTagSelect(tag);
    }
  };

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={clsx('flex flex-wrap gap-3', className)}>
      <FadeInStagger>
        {showAllButton && (
          <FadeIn>
            <button
              onClick={() => handleTagClick(null)}
              className={clsx(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                selectedTag === null
                  ? 'bg-neutral-950 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              )}
            >
              All Posts
            </button>
          </FadeIn>
        )}
        
        {tags.map((tag) => (
          <FadeIn key={tag.tag}>
            <button
              onClick={() => handleTagClick(tag.tag)}
              className={clsx(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                selectedTag === tag.tag
                  ? 'bg-neutral-950 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              )}
            >
              {tag.tag}
              {tag.count > 0 && (
                <span className="ml-2 rounded-full bg-neutral-600 px-2 py-0.5 text-xs text-white">
                  {tag.count}
                </span>
              )}
            </button>
          </FadeIn>
        ))}
      </FadeInStagger>
    </div>
  );
}

// Variant for displaying tags as simple labels (for individual posts)
interface TagListProps {
  tags: string[];
  className?: string;
  lang: string;
}

export function TagList({ 
  tags, 
  className, 
  lang
}: TagListProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={clsx('flex flex-wrap gap-2', className)}>
      {tags.map((tag) => (
        <a
          key={tag}
          href={`/${lang}/blog?tag=${encodeURIComponent(tag)}`}
          className={clsx(
            'rounded-full px-3 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors'
          )}
        >
          {tag}
        </a>
      ))}
    </div>
  );
}

// Component for displaying tag counts
interface TagStatsProps {
  tags: Tag[];
  className?: string;
}

export function TagStats({ tags, className }: TagStatsProps) {
  const totalPosts = tags.reduce((sum, tag) => sum + tag.count, 0);

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={clsx('text-sm text-neutral-600', className)}>
      <span className="font-medium">{totalPosts}</span> posts across{' '}
      <span className="font-medium">{tags.length}</span> tags
    </div>
  );
} 