import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { useTheme } from '@mui/material/styles';
import {
    Box,
    Typography,
    RadioGroup,
    Radio,
    FormControlLabel,
    TextField,
    MenuItem,
    Button
} from "@mui/material";
import { TimeUnit, TIME_UNITS, Settings, DEFAULT_SETTINGS, APPLIED_MESSAGE_ACTION, SETTINGS_KEYS } from "./global";

const Popup = () => {
    const [enabled, setEnabled] = useState<boolean>(DEFAULT_SETTINGS.enabled);
    const [value, setValue] = useState<number>(DEFAULT_SETTINGS.value);
    const [unit, setUnit] = useState<TimeUnit>(DEFAULT_SETTINGS.unit);

    const [originalSettings, setOriginalSettings] = useState<Settings>({
        enabled: DEFAULT_SETTINGS.enabled,
        value: DEFAULT_SETTINGS.value,
        unit: DEFAULT_SETTINGS.unit
    });

    useEffect(() => {
        chrome.storage.sync.get(SETTINGS_KEYS, (data: Partial<Settings>) => {
            const settings: Settings = {
                enabled: data.enabled ?? DEFAULT_SETTINGS.enabled,
                value: data.value ?? DEFAULT_SETTINGS.value,
                unit: (data.unit as TimeUnit) ?? DEFAULT_SETTINGS.unit
            };

            setEnabled(settings.enabled);
            setValue(settings.value);
            setUnit(settings.unit);
            setOriginalSettings(settings);
        });
    }, []);

    const handleApply = async () => {
        const newSettings: Settings = { enabled, value, unit };
        await chrome.storage.sync.set(newSettings);
        await chrome.runtime.sendMessage({ action: APPLIED_MESSAGE_ACTION, settings: newSettings });
        setOriginalSettings(newSettings);
    };

    const theme = useTheme();

    return (
        <Box sx={{ width: 384 }}>
            <Box sx={{ py: 2, px: 4, color: "white", backgroundColor: theme.palette.primary.main }}>
                <Typography variant="h6">
                    History AutoDelete
                </Typography>
            </Box>
            <Box sx={{ p: 4 }}>
                <RadioGroup
                    value={enabled ? "on" : "off"}
                    onChange={(e) => setEnabled(e.target.value === "on")}
                >
                    <FormControlLabel
                        value="on"
                        control={<Radio />}
                        label="Auto-delete history older than"
                    />

                    <Box sx={{ ml: 4, mb: 3 }}>
                        <TextField
                            size="small"
                            type="number"
                            inputProps={{ min: 1, max: 99 }}
                            value={value}
                            onChange={(e) => setValue(parseInt(e.target.value) || 1)}
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
                                    {value > 1 ? `${u}s` : u}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>


                    <FormControlLabel
                        value="off"
                        control={<Radio />}
                        label="Don't auto-delete history"
                    />
                </RadioGroup>

                <Box sx={{ mt: 6, display: "flex", justifyContent: "flex-end" }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleApply}
                        disabled={enabled === originalSettings.enabled &&
                            value === originalSettings.value &&
                            unit === originalSettings.unit}
                        sx={{ minWidth: 100 }}
                    >
                        Apply
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Popup />);