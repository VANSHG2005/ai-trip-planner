import React from 'react';

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2">
      <div className="bg-slate-200 animate-pulse w-full h-[180px] rounded-xl"></div>
      <div className="bg-slate-200 animate-pulse h-6 w-3/4 rounded-md"></div>
      <div className="bg-slate-200 animate-pulse h-4 w-1/2 rounded-md"></div>
    </div>
  );
}

export default SkeletonCard;