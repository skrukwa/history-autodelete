import { MS_PER, Settings, DEFAULT_SETTINGS, ALARM_NAME, APPLIED_MESSAGE_ACTION } from './global';

async function checkAndDeleteHistory(settings?: Settings): Promise<void> {
    if (!settings) {
        settings = await chrome.storage.sync.get({
            enabled: DEFAULT_SETTINGS.enabled,
            value: DEFAULT_SETTINGS.value,
            unit: DEFAULT_SETTINGS.unit,
        }) as Settings;
    }

    const { enabled, value, unit } = settings;

    if (!enabled || !value || !MS_PER[unit]) {
        return;
    }

    const msAgo = value * MS_PER[unit];
    const cutoff = Date.now() - msAgo;

    await chrome.history.deleteRange({
        startTime: 0,
        endTime: cutoff
    });
}

// run on startup
chrome.runtime.onStartup.addListener(() => {
    checkAndDeleteHistory();
});

// handle applied messages
chrome.runtime.onMessage.addListener((request: { action: string; settings?: Settings }) => {
    if (request.action === APPLIED_MESSAGE_ACTION) checkAndDeleteHistory(request.settings);
});

// set up 10 minute alarms
chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: 10 });
});
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) checkAndDeleteHistory();
});