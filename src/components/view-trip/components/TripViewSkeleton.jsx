import React from 'react';

function TripViewSkeleton() {
  return (
    <div className="space-y-12 animate-pulse">
      {/* Info Section Skeleton */}
      <div>
        <div className="bg-slate-200 h-[350px] w-full rounded-xl"></div>
        <div className="mt-5 flex justify-between items-center">
          <div className="flex flex-col gap-2 w-2/3">
            <div className="h-8 bg-slate-200 rounded-md"></div>
            <div className="flex gap-4 mt-2">
              <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
              <div className="h-6 w-28 bg-slate-200 rounded-full"></div>
              <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
            </div>
          </div>
          <div className="h-12 w-12 bg-slate-200 rounded-lg"></div>
        </div>
      </div>

      <hr />

      {/* Hotels Section Skeleton */}
      <div>
        <div className="h-10 w-1/3 bg-slate-200 rounded-md mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>

      <hr />

      {/* Places to Visit Skeleton */}
      <div>
        <div className="h-10 w-1/2 bg-slate-200 rounded-md mb-6"></div>
        <div className="space-y-6">
          <div className="h-40 bg-slate-200 rounded-xl"></div>
          <div className="h-40 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

export default TripViewSkeleton;