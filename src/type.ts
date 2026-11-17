export type Settings = {
    fontSize: string;
    ui: "fluid" | "box" | "auto";
    showLogo: boolean;
    newNoteBehavior: "open-last" | "start-fresh";
    sidebarPinned: boolean;
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
