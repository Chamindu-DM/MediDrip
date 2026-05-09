import React from 'react';

function ProgressBar({ progress }) {
  return (
    <div className="self-stretch h-2 relative bg-stone-200 rounded-lg overflow-hidden">
      <div
        className="h-full bg-brand-green rounded-lg progress-fill"
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      />
      <div
        className="w-2 h-2 absolute top-0 bg-brand-primary rounded-full progress-dot shadow-sm"
        style={{ left: `${Math.max(0, Math.min(100, progress))}%`, transform: 'translateX(-50%)' }}
      />
    </div>
  );
}

export default ProgressBar;
