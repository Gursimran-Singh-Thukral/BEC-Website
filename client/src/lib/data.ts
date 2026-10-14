import "server-only";
import { pub } from "./api";
import type { EventRow, EventWithSeats, Handbook, Settings, TeamMember, Vertical } from "./types";

/** Typed wrappers around the public API endpoints used by the site's pages. */

export const getSite = () => pub<{ settings: Settings }>("/public/site");

export const getHome = () =>
  pub<{ settings: Settings; next: EventWithSeats | null; pastCount: number; handbooks: Handbook[] }>("/public/home");

export const getEvents = () => pub<{ settings: Settings; upcoming: EventWithSeats[]; past: EventRow[] }>("/public/events");

export const getEvent = (slug: string) => pub<EventWithSeats>(`/public/events/${encodeURIComponent(slug)}`);

export type TeamData = {
  settings: Settings;
  faculty: TeamMember[];
  staff: TeamMember[];
  core: TeamMember[];
  teamCount: number;
  verticals: (Vertical & { members: TeamMember[] })[];
};
export const getTeam = () => pub<TeamData>("/public/team");

export const getHandbooks = () => pub<{ handbooks: Handbook[] }>("/public/handbooks");

export const getJoin = () => pub<{ settings: Settings; verticals: string[] }>("/public/join");
