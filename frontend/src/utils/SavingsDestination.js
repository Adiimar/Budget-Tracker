// Preset savings destinations with icon + color theme.
// destinationType is stored on the backend so the frontend can re-derive styling.

export const SAVINGS_PRESETS = [
  {
    name: 'Landbank',
    type: 'BANK',
    gradient: 'from-emerald-500 to-green-600',
    icon: (
      <>
        <path d="M3 21h18" />
        <path d="M5 21V9l7-5 7 5v12" />
        <path d="M9 21v-6h6v6" />
      </>
    ),
  },
  {
    name: 'Maribank',
    type: 'MARIBANK',
    gradient: 'from-orange-500 to-amber-600',
    icon: (
      <>
        <path d="M3 21h18" />
        <path d="M5 21V9l7-5 7 5v12" />
        <path d="M9 21v-6h6v6" />
      </>
    ),
  },
];

export const CUSTOM_DESTINATION_TYPE = 'CUSTOM';

export const getDestinationStyle = (destinationType) => {
  if (destinationType === 'BANK') return SAVINGS_PRESETS[0];
  if (destinationType === 'MARIBANK') return SAVINGS_PRESETS[1];
  if (destinationType === 'EWALLET') {
    return {
      gradient: 'from-purple-500 to-fuchsia-600',
      icon: (
        <>
          <rect x="2" y="6" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
          <circle cx="17" cy="15" r="1.5" />
        </>
      ),
    };
  }
  return {
    gradient: 'from-blue-500 to-sky-600',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </>
    ),
  };
};