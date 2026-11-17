/**
 * The site is two pages: the landing page (index.html) and the 3D campus
 * (campus.html). This module is the only place that knows how they link up,
 * so both pages agree on page names and query parameters.
 */

const CAMPUS_PAGE = 'campus.html';
const LOW_PERF_PARAM = 'lowperf';
const ROOM_PARAM = 'room';

export interface CampusOptions {
  /** Trade visual quality for frame rate on older laptops and phones. */
  lowPerf: boolean;
  /** Open this room straight away instead of the campus overview (entry-screen area choice). */
  room?: string;
}

/** URL of the 3D campus page, resolved relative to the current page. */
export function campusUrl(options: CampusOptions): string {
  const url = new URL(CAMPUS_PAGE, window.location.href);
  if (options.lowPerf) url.searchParams.set(LOW_PERF_PARAM, '1');
  if (options.room) url.searchParams.set(ROOM_PARAM, options.room);
  return url.toString();
}

/** Reads the options the landing page passed to the campus page. */
export function readCampusOptions(search: string = window.location.search): CampusOptions {
  const params = new URLSearchParams(search);
  return { lowPerf: params.get(LOW_PERF_PARAM) === '1', room: params.get(ROOM_PARAM) ?? undefined };
}
