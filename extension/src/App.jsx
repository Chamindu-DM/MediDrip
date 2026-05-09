import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import AddFluidModal from './components/AddFluidModal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const DAILY_GOAL = 2000; // ml

function App() {
  const { isAuthenticated, isLoading: authLoading, getAccessToken } = useAuth();
  const [totalIntake, setTotalIntake] = useState(0);
  const [totalOutput, setTotalOutput] = useState(0);
  const [modalType, setModalType] = useState(null); // 'INTAKE' | 'OUTPUT' | null
  const [isLoading, setIsLoading] = useState(true);
  const [reminderTime, setReminderTime] = useState(null);
  const [dayStart, setDayStart] = useState(null);

  // Calculate ml remaining
  const mlLeft = Math.max(0, DAILY_GOAL - (totalIntake - totalOutput));
  const progress = Math.min(100, ((totalIntake - totalOutput) / DAILY_GOAL) * 100);

  // Initialize day tracking
  useEffect(() => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    setDayStart(start);
  }, []);

  // Fetch daily totals from backend
  const fetchDailyTotals = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      const token = await getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/logs/daily`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setTotalIntake(data.totalIntake || 0);
        setTotalOutput(data.totalOutput || 0);
      }
    } catch (err) {
      console.error('Failed to fetch daily totals:', err);
      // Fall back to local storage
      try {
        const stored = await chrome.storage?.local?.get?.(['totalIntake', 'totalOutput']);
        if (stored) {
          setTotalIntake(stored.totalIntake || 0);
          setTotalOutput(stored.totalOutput || 0);
        }
      } catch {}
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getAccessToken]);

  useEffect(() => {
    if (!authLoading) {
      fetchDailyTotals();
    }
  }, [authLoading, fetchDailyTotals]);

  // Load reminder time from storage
  useEffect(() => {
    const loadReminder = async () => {
      try {
        const stored = await chrome.storage?.local?.get?.(['nextReminder']);
        if (stored?.nextReminder) {
          setReminderTime(new Date(stored.nextReminder));
        } else {
          // Default: next reminder in 2 hours
          const next = new Date();
          next.setHours(next.getHours() + 2, 0, 0, 0);
          setReminderTime(next);
        }
      } catch {
        const next = new Date();
        next.setHours(next.getHours() + 2, 0, 0, 0);
        setReminderTime(next);
      }
    };
    loadReminder();
  }, []);

  // Add fluid log
  const addFluidLog = async (type, amount) => {
    // Update local state immediately (optimistic)
    if (type === 'INTAKE') {
      setTotalIntake((prev) => prev + amount);
    } else {
      setTotalOutput((prev) => prev + amount);
    }

    // Persist to chrome storage as fallback
    try {
      const newIntake = type === 'INTAKE' ? totalIntake + amount : totalIntake;
      const newOutput = type === 'OUTPUT' ? totalOutput + amount : totalOutput;
      await chrome.storage?.local?.set?.({
        totalIntake: newIntake,
        totalOutput: newOutput,
      });
    } catch {}

    // Send to backend
    if (isAuthenticated) {
      try {
        const token = await getAccessToken();
        if (token) {
          await fetch(`${API_BASE}/api/logs`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type, amount }),
          });
        }
      } catch (err) {
        console.error('Failed to sync log to backend:', err);
      }
    }

    // Reset the reminder alarm after logging
    try {
      const next = new Date();
      next.setHours(next.getHours() + 2, 0, 0, 0);
      setReminderTime(next);
      await chrome.storage?.local?.set?.({ nextReminder: next.toISOString() });
      await chrome.alarms?.create?.('hydration-reminder', {
        delayInMinutes: 120,
      });
    } catch {}

    setModalType(null);
  };

  // Format time helper
  const formatTime = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="w-96 h-48 flex items-center justify-center bg-white rounded-2xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-black/40 text-sm font-instrument">Loading...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="relative">
      <Dashboard
        totalIntake={totalIntake}
        totalOutput={totalOutput}
        mlLeft={mlLeft}
        progress={progress}
        reminderTime={reminderTime}
        dayStart={dayStart}
        formatTime={formatTime}
        onAddIntake={() => setModalType('INTAKE')}
        onAddOutput={() => setModalType('OUTPUT')}
        isLoading={isLoading}
      />

      {modalType && (
        <AddFluidModal
          type={modalType}
          onAdd={(amount) => addFluidLog(modalType, amount)}
          onClose={() => setModalType(null)}
        />
      )}
    </div>
  );
}

export default App;
