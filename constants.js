
import { ClockFont } from './types.js';

export const THEME_PRESETS = [
  {
    name: 'Midnight',
    style: {
      backgroundColor: 'bg-slate-900',
      textColor: 'text-slate-100',
      font: ClockFont.MONO,
      borderWidth: 1,
    }
  },
  {
    name: 'Electric',
    style: {
      backgroundColor: 'bg-indigo-600',
      textColor: 'text-white',
      font: ClockFont.SANS,
      borderWidth: 0,
    }
  },
  {
    name: 'Minimal',
    style: {
      backgroundColor: 'bg-white',
      textColor: 'text-slate-900',
      font: ClockFont.SANS,
      borderWidth: 1,
    }
  },
  {
    name: 'Emerald',
    style: {
      backgroundColor: 'bg-emerald-500',
      textColor: 'text-emerald-50',
      font: ClockFont.MONO,
      borderWidth: 0,
    }
  },
  {
    name: 'Warm Sun',
    style: {
      backgroundColor: 'bg-amber-100',
      textColor: 'text-amber-900',
      font: ClockFont.SERIF,
      borderWidth: 2,
    }
  }
];

export const INITIAL_WIDGETS = [
  {
    id: '1',
    label: 'Home',
    locationName: 'Local Time',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    size: 'medium',
    style: THEME_PRESETS[0].style,
    isFavorite: true,
  }
];
