export type Settings = {
    fontSize: string;
    ui: "fluid" | "box" | "auto";
    showLogo: boolean;
    newNoteBehavior: "open-last" | "start-fresh";
};

export type NoteMeta = {
    id: string;
    title: string;
    updatedAt: number;
};
