export type Settings = {
    fontSize: string;
    ui: "fluid" | "box" | "centered" | "auto";
    showLogo: boolean;
    newNoteBehavior: "open-last" | "start-fresh";
    sidebarPinned: boolean;
    statusBar: StatusBarSettings;
    clock: ClockSettings;
};

export type StatusBarItem = "cursor" | "selection" | "words" | "chars" | "lines" | "readTime" | "time";

export type StatusBarSettings = Record<StatusBarItem, boolean>;

export type ClockSettings = {
    hourFormat: "12h" | "24h";
    showDate: boolean;
    showSeconds: boolean;
};

/** Details of the file a note was opened from, reused when the note is saved back to disk. */
export type FileMeta = {
    name: string;
    type: string;
    lastModified: number;
};

export type NoteMeta = {
    id: string;
    title: string;
    updatedAt: number;
    file?: FileMeta;
};
