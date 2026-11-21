// Unknown or zero minutes show as "N/A".
export const formatMinutes = (minutes: number | null): string =>
  minutes ? `${minutes} min` : "N/A";
