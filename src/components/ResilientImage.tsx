import { useState } from 'react';
import { Store } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ResilientImage({ src, alt, className = '' }: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F3ECE1] to-[#E6DAC7] text-[#5C544B] p-4 text-center ${className}`}
      >
        <Store className="w-7 h-7 text-[#B85231]/70 mb-2" aria-hidden="true" />
        <span className="text-xs font-medium text-[#5C544B] line-clamp-2 max-w-[18ch]">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
