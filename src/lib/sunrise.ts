/**
 * NOAA sunrise approximation (±2 min), used for the morning-training caption.
 * Returns local time in the given IANA zone as "HH:MM".
 */
export function sunriseAt(lat: number, lng: number, date = new Date(), timeZone = "Europe/Moscow"): string {
  const rad = Math.PI / 180;
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const doy = Math.floor((date.getTime() - start) / 86400000);
  // fractional year (radians)
  const gamma = ((2 * Math.PI) / 365) * (doy - 1 + (date.getUTCHours() - 12) / 24);
  const eqtime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);
  const zenith = 90.833 * rad;
  const cosHa = Math.cos(zenith) / (Math.cos(lat * rad) * Math.cos(decl)) - Math.tan(lat * rad) * Math.tan(decl);
  if (cosHa > 1 || cosHa < -1) return "—";
  const ha = Math.acos(cosHa) / rad;
  const sunriseUtcMin = 720 - 4 * (lng + ha) - eqtime; // minutes after UTC midnight
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0) + sunriseUtcMin * 60000);
  return new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hour12: false }).format(utc);
}
