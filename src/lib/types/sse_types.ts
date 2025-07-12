import type { NoteLink } from "./response_types.ts";

export type EventType = 'stream' | 'complete' | 'message' | 'error' | 'tool' | 'notes-link' | 'web-link';

export interface SSEEvent {
  event: EventType;
  data: SSEMessage;
}

export interface SSEMessage {
    event : EventType
    content : string
    links? : NoteLink
}
