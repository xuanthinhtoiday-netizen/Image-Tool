import React from 'react';

interface MetaHaloLogoProps {
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  className?: string;
}

export const MetaHaloLogo: React.FC<MetaHaloLogoProps> = ({
  size = 'sm',
  glow = false,
  className = '',
}) => {
  const outer =
    size === 'lg'
      ? 'h-16 w-16 p-[5px]'
      : size === 'md'
        ? 'h-8 w-8 p-[3px]'
        : 'h-7 w-7 p-[2.5px]';

  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center ${
        glow ? 'meta-ring-glow' : ''
      } ${className}`}
    >
      <div className={`meta-ring relative z-10 flex items-center justify-center ${outer}`}>
        <div
          className="h-full w-full rounded-full"
          style={{ backgroundColor: 'var(--bg-canvas)' }}
        />
      </div>
    </div>
  );
};
