import { ALARM_NAME, APPLIED_MESSAGE_ACTION, DEFAULT_SETTINGS, MS_PER, Settings } from "./global"

async function deleteHistory(settings?: Settings): Promise<void> {
    if (!settings) {
        settings = await chrome.storage.sync.get({
            enabled: DEFAULT_SETTINGS.enabled,
            value: DEFAULT_SETTINGS.value,
            unit: DEFAULT_SETTINGS.unit,
        }) as Settings
    }

    const { enabled, value, unit } = settings

    if (!enabled || !value || !MS_PER[unit]) {
        return
    }

    const msAgo = value * MS_PER[unit]
    const cutoff = Date.now() - msAgo

    await chrome.history.deleteRange({
        startTime: 0,
        endTime: cutoff
    })
}

// install alarm
chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: 5 })
})

// ensure alarm
chrome.runtime.onStartup.addListener(() => {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: 5 })
})

// handle alarm
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) deleteHistory()
})

// handle applied
chrome.runtime.onMessage.addListener((request: { action: string, settings?: Settings }) => {
    if (request.action === APPLIED_MESSAGE_ACTION) deleteHistory(request.settings)
})