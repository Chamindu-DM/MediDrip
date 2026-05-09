// MediDrip Background Service Worker
// Handles Chrome alarms and notifications for hydration reminders

const ALARM_NAME = 'hydration-reminder';
const DEFAULT_INTERVAL_MINUTES = 120; // 2 hours

// Set up the initial alarm when the extension is installed
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[MediDrip] Extension installed - setting up initial alarm');

  // Create the first reminder alarm
  await chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: DEFAULT_INTERVAL_MINUTES,
    periodInMinutes: DEFAULT_INTERVAL_MINUTES,
  });

  // Store the next reminder time
  const nextReminder = new Date();
  nextReminder.setMinutes(nextReminder.getMinutes() + DEFAULT_INTERVAL_MINUTES);
  await chrome.storage.local.set({
    nextReminder: nextReminder.toISOString(),
  });
});

// Handle alarm triggers
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    console.log('[MediDrip] Hydration reminder alarm triggered');

    // Show a system notification
    chrome.notifications.create('hydration-reminder-notification', {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
      title: '💧 MediDrip Reminder',
      message: 'Time to hydrate! Log your fluid intake now.',
      priority: 2,
      requireInteraction: false,
    });

    // Update the next reminder time in storage
    const nextReminder = new Date();
    nextReminder.setMinutes(nextReminder.getMinutes() + DEFAULT_INTERVAL_MINUTES);
    await chrome.storage.local.set({
      nextReminder: nextReminder.toISOString(),
    });
  }
});

// Handle notification clicks - open the popup
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === 'hydration-reminder-notification') {
    chrome.action.openPopup?.();
    chrome.notifications.clear(notificationId);
  }
});

// Listen for messages from the popup to update alarm settings
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_REMINDER') {
    const { delayMinutes } = message;
    
    chrome.alarms.clear(ALARM_NAME, async () => {
      await chrome.alarms.create(ALARM_NAME, {
        delayInMinutes: delayMinutes,
        periodInMinutes: DEFAULT_INTERVAL_MINUTES,
      });

      const nextReminder = new Date();
      nextReminder.setMinutes(nextReminder.getMinutes() + delayMinutes);
      await chrome.storage.local.set({
        nextReminder: nextReminder.toISOString(),
      });

      sendResponse({ success: true, nextReminder: nextReminder.toISOString() });
    });

    return true; // Indicates async sendResponse
  }

  if (message.type === 'RESET_DAILY') {
    chrome.storage.local.set({
      totalIntake: 0,
      totalOutput: 0,
      lastResetDate: new Date().toDateString(),
    });
    sendResponse({ success: true });
    return true;
  }
});

// Daily reset check - reset counters at midnight
chrome.alarms.create('daily-reset-check', {
  periodInMinutes: 60, // Check every hour
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'daily-reset-check') {
    const stored = await chrome.storage.local.get(['lastResetDate']);
    const today = new Date().toDateString();

    if (stored.lastResetDate !== today) {
      await chrome.storage.local.set({
        totalIntake: 0,
        totalOutput: 0,
        lastResetDate: today,
      });
      console.log('[MediDrip] Daily counters reset');
    }
  }
});
