import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="flex flex-col bg-[#121214] rounded-xl overflow-hidden border border-zinc-800/40 animate-pulse">
      <div className="aspect-[16/10] bg-zinc-900 w-full" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-4 bg-zinc-800 rounded w-3/4" />
        <div className="h-3 bg-zinc-800/60 rounded w-full" />
        <div className="h-3 bg-zinc-800/40 rounded w-1/2" />
        <div className="flex gap-2 pt-2">
          <div className="h-4 w-12 bg-zinc-800 rounded-full" />
          <div className="h-4 w-16 bg-zinc-800 rounded-full" />
        </div>
      </div>
    </div>
  );
};

