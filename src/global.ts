export const MS_PER: Record<TimeUnit, number> = {
    hour: 1000 * 60 * 60,
    day: 1000 * 60 * 60 * 24,
    week: 1000 * 60 * 60 * 24 * 7,
    month: 1000 * 60 * 60 * 24 * 30,
} as const;


export type TimeUnit = 'hour' | 'day' | 'week' | 'month';
export const TIME_UNITS: TimeUnit[] = ['hour', 'day', 'week', 'month'];

export interface Settings {
    enabled: boolean;
    value: number;
    unit: TimeUnit;
}

export const SETTINGS_KEYS: string[] = ['enabled', 'value', 'unit'];

export const DEFAULT_SETTINGS: Settings = {
    enabled: false,
    value: 1,
    unit: 'week',
};

export const APPLIED_MESSAGE_ACTION = 'run';

export const ALARM_NAME = 'run';