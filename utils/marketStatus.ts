export type MarketSession = {
  isOpen: boolean;
  label: string;
  market: string;
  nextSession: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}



function toMinutes(hours: number, minutes: number) {
  return hours * 60 + minutes;
}

export function getMarketStatus(date: Date = new Date()): MarketSession {
  // NSE (India) Trading hours
  // Monday-Friday
  // Open: 9:15 AM IST
  // Close: 3:30 PM IST
  // Closed: Saturday, Sunday

  // JS Date uses local time; we assume app server/client is in IST-ish or at least
  // that only day-of-week matters. Time math here uses the local clock.
  const day = date.getDay(); // 0 Sun - 6 Sat
  const isWeekend = day === 0 || day === 6;

  const openMinutes = toMinutes(9, 15);
  const closeMinutes = toMinutes(15, 30);

  const minutesNow = date.getHours() * 60 + date.getMinutes();

  const isOpen = !isWeekend && minutesNow >= openMinutes && minutesNow <= closeMinutes;


  const market = "NSE";
  const label = isWeekend ? "Closed" : isOpen ? "Open" : "Closed";

  // Next session (best-effort, based on day-of-week)
  let nextSession = "—";
  if (!isWeekend) {
    if (minutesNow < openMinutes) {
      nextSession = `Opens ${pad2(9)}:${pad2(15)} AM IST`;
    } else if (minutesNow > closeMinutes) {
      // next trading day at open
      let delta = 1;
      while (true) {
        const nextDay = (day + delta) % 7;
        if (nextDay !== 0 && nextDay !== 6) break;
        delta += 1;
      }
      nextSession = `Next opens ${pad2(9)}:${pad2(15)} AM IST`;
    } else {
      nextSession = `Closes ${pad2(15)}:${pad2(30)} PM IST`;
    }
  } else {
    // Saturday -> next Monday, Sunday -> next Monday
    nextSession = `Opens ${pad2(9)}:${pad2(15)} AM IST`;
  }

  return { isOpen, label, market, nextSession };
}

