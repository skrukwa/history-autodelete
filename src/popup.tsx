import { Box, Button, FormControlLabel, MenuItem, Radio, RadioGroup, TextField, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useEffect, useState } from "react"
import ReactDOM from "react-dom/client"
import { APPLIED_MESSAGE_ACTION, DEFAULT_SETTINGS, MS_PER, Settings, SETTINGS_KEYS, TIME_UNITS, TimeUnit } from "./global"

const Popup = () => {
    const [enabled, setEnabled] = useState<boolean>(DEFAULT_SETTINGS.enabled)
    const [value, setValue] = useState<number | ''>(DEFAULT_SETTINGS.value)
    const [unit, setUnit] = useState<TimeUnit>(DEFAULT_SETTINGS.unit)

    const [savedSettings, setSavedSettings] = useState<Settings>(DEFAULT_SETTINGS)

    const [historyCount, setHistoryCount] = useState<number | null>(null)

    useEffect(() => {
        chrome.storage.sync.get(SETTINGS_KEYS, (data: Partial<Settings>) => {
            const loadedSettings: Settings = {
                enabled: data.enabled ?? DEFAULT_SETTINGS.enabled,
                value: data.value ?? DEFAULT_SETTINGS.value,
                unit: (data.unit as TimeUnit) ?? DEFAULT_SETTINGS.unit
            }

            setEnabled(loadedSettings.enabled)
            setValue(loadedSettings.value)
            setUnit(loadedSettings.unit)

            setSavedSettings(loadedSettings)
        })
    }, [])

    const calculateHistoryCount = async () => {
        if (!enabled || !value || !MS_PER[unit]) {
            setHistoryCount(null)
            return
        }

        const msAgo = (value as number) * MS_PER[unit]
        const cutoff = Date.now() - msAgo

        const historyItems = await chrome.history.search({
            text: '',
            startTime: 0,
            endTime: cutoff,
            maxResults: 0
        })

        setHistoryCount(historyItems.length)
    }

    useEffect(() => {
        // calculateHistoryCount on a 500ms debounce
        const timeoutId = setTimeout(() => {
            calculateHistoryCount()
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [enabled, value, unit])

    const handleApply = async () => {
        // value will be a number or else apply would have been disabled
        const newSettings: Settings = { enabled, value: value as number, unit }
        await chrome.storage.sync.set(newSettings)
        await chrome.runtime.sendMessage({ action: APPLIED_MESSAGE_ACTION, settings: newSettings })
        setSavedSettings(newSettings)
        setHistoryCount(null)
    }

    const isApplyDisabled = (enabled === savedSettings.enabled
        && value === savedSettings.value
        && unit === savedSettings.unit)
        || value === ''

    const theme = useTheme()

    return (
        <Box sx={{ width: 384 }}>
            <Box sx={{ py: 2, px: 4, color: "white", backgroundColor: theme.palette.primary.main }}>
                <Typography variant="h6">
                    History AutoDelete
                </Typography>
            </Box>
            <Box sx={{ m: 3 }}>
                <RadioGroup
                    value={enabled ? "on" : "off"}
                    onChange={(e) => setEnabled(e.target.value === "on")}
                >
                    <FormControlLabel
                        value="on"
                        control={<Radio />}
                        label={
                            <Box>
                                <Typography sx={{ py: 1.125 }}>Auto-delete history older than</Typography>
                                <Box>
                                    <TextField
                                        size="small"
                                        type="number"
                                        slotProps={{
                                            htmlInput: {
                                                min: 1,
                                                max: 99,
                                                // handle '.', 'e', '+', '-', etc. that do not fire onChange
                                                onInput: (e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')
                                            }
                                        }}
                                        value={value}
                                        onChange={(e) => /^([1-9][0-9]?)?$/.test(e.target.value) && setValue(parseInt(e.target.value) || '')}
                                        sx={{ width: 64, mr: 2 }}
                                    />
                                    <TextField
                                        size="small"
                                        select
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value as TimeUnit)}
                                        sx={{ width: 128 }}
                                    >
                                        {TIME_UNITS.map((u) => (
                                            <MenuItem key={u} value={u}>
                                                {value !== '' && value > 1 ? `${u}s` : u}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Box>
                            </Box>
                        }
                        sx={{ m: 0, mb: 2, alignItems: "start" }}
                    />
                    <FormControlLabel
                        value="off"
                        control={<Radio />}
                        label={
                            <Typography sx={{ py: 1.125 }}>Don't auto-delete history</Typography>
                        }
                        sx={{ m: 0 }}
                    />
                </RadioGroup>
                <Box sx={{ mt: 6, display: "flex", alignItems: "center" }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleApply}
                        disabled={isApplyDisabled}
                        sx={{ minWidth: 100, m: 1.125 }}
                    >
                        Apply
                    </Button>
                    {enabled && !isApplyDisabled && historyCount !== null && (
                        <Typography variant="body2" sx={{ ml: 2, color: theme.palette.text.secondary }}>
                            This will immediately delete
                            <br />
                            {`${historyCount.toLocaleString()} history record${historyCount !== 1 ? 's' : ''}`}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Box>
    )
}

ReactDOM.createRoot(document.getElementById("root")).render(<Popup />)