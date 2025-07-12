
export interface NewChatMessage {
    id: string;
    role: string;
    content: string;
    noteLinks? : NoteLink[];
    webLinks? : string[];
    timestamp?: number;
}

export interface NoteLink {
    url : string
    content : string
}