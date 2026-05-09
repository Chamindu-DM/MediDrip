import React from 'react';
import { useAuth } from '../hooks/useAuth';
import ProgressBar from './ProgressBar';

function Dashboard({
  totalIntake,
  totalOutput,
  mlLeft,
  progress,
  reminderTime,
  dayStart,
  formatTime,
  onAddIntake,
  onAddOutput,
  isLoading,
}) {
  const { signOut, user } = useAuth();
  const userName = user?.given_name || user?.username || 'User';

  // Compute tomorrow end time
  const dayEnd = dayStart ? new Date(dayStart.getTime() + 24 * 60 * 60 * 1000) : null;

  return (
    <div className="w-96 p-4 bg-white rounded-2xl inline-flex flex-col justify-start items-start gap-4 shadow-xl shadow-black/5">
      {/* Header */}
      <div className="self-stretch inline-flex justify-start items-center gap-2">
        <div className="flex-1 flex items-center gap-2">
          <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
          <span className="text-black text-base font-medium font-instrument leading-5">
            Fluid Monitor
          </span>
        </div>
        <button
          onClick={() => signOut()}
          id="logout-button"
          className="w-9 h-9 flex justify-center items-center rounded-lg hover:bg-black/5 transition-colors"
          title={`Sign out (${userName})`}
        >
          <svg className="w-5 h-5 text-black/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      {/* Progress section */}
      <div className="self-stretch flex flex-col justify-start items-start gap-2">
        <ProgressBar progress={progress} />
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="flex justify-center items-center gap-1">
            <span className="text-black/60 text-xs font-medium font-instrument leading-3 tracking-tight">
              Since Today
            </span>
            <div className="w-[3px] h-[3px] bg-black/40 rounded-full" />
            <span className="text-black text-xs font-medium font-instrument leading-3 tracking-tight">
              {dayStart ? formatTime(dayStart) : '12:00 AM'}
            </span>
          </div>
          <div className="flex justify-center items-center gap-1">
            <span className="text-black/60 text-xs font-medium font-instrument leading-3 tracking-tight">
              Ends tomorrow
            </span>
            <div className="w-[3px] h-[3px] bg-black/40 rounded-full" />
            <span className="text-black text-xs font-medium font-instrument leading-3 tracking-tight">
              {dayEnd ? formatTime(dayEnd) : '12:00 AM'}
            </span>
          </div>
        </div>
      </div>

      {/* Main counter */}
      <div className="self-stretch py-4 inline-flex justify-between items-end">
        {isLoading ? (
          <div className="flex items-end gap-2">
            <div className="w-32 h-14 bg-black/5 rounded-lg animate-pulse" />
          </div>
        ) : (
          <>
            <span className="text-black text-6xl font-medium font-instrument tracking-tight counter-value tabular-nums">
              {mlLeft}
            </span>
            <span className="text-black/60 text-xl font-medium font-instrument leading-3 tracking-tight pb-2">
              ml left
            </span>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="self-stretch h-px bg-black/10" />

      {/* Stats row */}
      <div className="self-stretch py-2 inline-flex justify-start items-start gap-1">
        <div className="flex-1 inline-flex flex-col justify-center items-start gap-1">
          <span className="text-black/60 text-base font-medium font-instrument leading-5">
            Total intake:
          </span>
          <span className="text-black text-xl font-medium font-instrument leading-5 tabular-nums">
            {isLoading ? '—' : `${totalIntake} ml`}
          </span>
        </div>
        <div className="flex-1 inline-flex flex-col justify-center items-end gap-1">
          <span className="text-black/60 text-base font-medium font-instrument leading-5">
            Total output:
          </span>
          <span className="text-black text-xl font-medium font-instrument leading-5 tabular-nums">
            {isLoading ? '—' : `${totalOutput} ml`}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="self-stretch h-px bg-black/10" />

      {/* Reminder row */}
      <div className="self-stretch py-2 inline-flex justify-center items-center gap-2">
        <div className="flex items-center gap-2 flex-1">
          <svg className="w-4 h-4 text-black/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="text-black text-base font-medium font-instrument leading-5">
            Next reminder at:
          </span>
        </div>
        <span className="text-brand-primary text-base font-semibold font-instrument leading-5">
          {reminderTime ? formatTime(reminderTime) : '--:--'}
        </span>
      </div>

      {/* Action buttons */}
      <div className="self-stretch inline-flex justify-start items-start gap-2">
        <button
          onClick={onAddIntake}
          id="add-intake-button"
          className="flex-1 py-3.5 bg-brand-primary rounded-lg flex justify-center items-center gap-1.5
                     hover:bg-indigo-800 active:scale-[0.98] transition-all duration-200 shadow-md shadow-brand-primary/20"
        >
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="text-white text-base font-medium font-instrument leading-5">
            Add intake
          </span>
        </button>
        <button
          onClick={onAddOutput}
          id="add-output-button"
          className="flex-1 py-3.5 bg-black/5 rounded-lg flex justify-center items-center gap-1.5
                     hover:bg-black/10 active:scale-[0.98] transition-all duration-200"
        >
          <svg className="w-5 h-5 text-black/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="text-black text-base font-medium font-instrument leading-5">
            Add output
          </span>
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
