export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getMapSearchUrl(location: string): string {
  return `https://maps.google.com/?q=${encodeURIComponent(location)}`;
}

interface IcsEventParams {
  title: string;
  location: string;
  datetime: string;
  description?: string;
  durationHours?: number;
}

function formatDateToIcs(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcsText(text: string): string {
  return text.replace(/[\\;,\n]/g, (match) => {
    if (match === "\n") return "\\n";
    return `\\${match}`;
  });
}

export function generateIcsFile({
  title,
  location,
  datetime,
  description = "",
  durationHours = 3,
}: IcsEventParams): string {
  const startDate = new Date(datetime);
  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

  const uid = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}@birthdaycard.app`;

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Birthday Card App//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatDateToIcs(new Date())}`,
    `DTSTART:${formatDateToIcs(startDate)}`,
    `DTEND:${formatDateToIcs(endDate)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `LOCATION:${escapeIcsText(location)}`,
    description ? `DESCRIPTION:${escapeIcsText(description)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return icsContent;
}

export function generateGoogleCalendarUrl({
  title,
  location,
  datetime,
  description = "",
  durationHours = 3,
}: IcsEventParams): string {
  const startDate = new Date(datetime);
  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

  const format = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${format(startDate)}/${format(endDate)}`,
    details: description,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateOutlookWebUrl({
  title,
  location,
  datetime,
  description = "",
  durationHours = 3,
}: IcsEventParams): string {
  const startDate = new Date(datetime);
  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

  const params = new URLSearchParams({
    subject: title,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    location,
    body: description,
    path: "/calendar/action/compose",
    rru: "addevent",
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
