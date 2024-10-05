export const formatDistance = (meters: number): number => {
  const kilometers = meters / 1000;
  const miles = kilometers * 0.62;
  const roundedDis = Math.round(miles * 10) / 10;
  return roundedDis;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });
  return formatter.format(date);
};

export function formatTime(isoString: string): string {
  const date: Date = new Date(isoString);
  const hours: number = date.getHours();
  const minutes: number | string = date.getMinutes();
  const ampm: string = hours >= 12 ? 'pm' : 'am';
  const formattedHours: number = hours % 12 || 12;
  const formattedMinutes: string =
    minutes < 10 ? '0' + minutes : minutes.toString();
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}
