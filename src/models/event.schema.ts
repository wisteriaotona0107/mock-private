export interface EventLog {
  event_id: string;
  ts: string;
  type: "OPEN" | "EMPTY";
  bottle_id: string;
}
