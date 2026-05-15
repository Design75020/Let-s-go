import React from 'react';

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`bg-white/5 animate-pulse rounded-xl ${className}`} />
);

export const SkeletonCard = () => (
  <div className="bg-white/5 rounded-2xl p-4 flex flex-col gap-3 animate-pulse">
    <div className="w-full h-32 bg-white/5 rounded-xl" />
    <div className="w-2/3 h-4 bg-white/10 rounded-md" />
    <div className="w-1/3 h-3 bg-white/5 rounded-md" />
  </div>
);
