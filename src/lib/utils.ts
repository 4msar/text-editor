export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");

export type ClockFormat = { hourFormat: "12h" | "24h"; showDate: boolean; showSeconds: boolean };

export const formatDate = (
    date: Date,
    { hourFormat = "12h", showDate = true, showSeconds = false }: Partial<ClockFormat> = {},
): string => {
    // default format: "Wed, 03 Jul, 12:00 AM"
    const options: Intl.DateTimeFormatOptions = {
        ...(showDate && { weekday: "short", day: "2-digit", month: "short" }),
        hour: "2-digit",
        minute: "2-digit",
        ...(showSeconds && { second: "2-digit" }),
        hourCycle: hourFormat === "24h" ? "h23" : "h12",
    };
    return date.toLocaleString("en-US", options);
};

export const formatRelative = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const minute = 60_000;
    if (diff < minute) return "just now";
    if (diff < 60 * minute) return `${Math.floor(diff / minute)}m ago`;
    if (diff < 24 * 60 * minute) return `${Math.floor(diff / (60 * minute))}h ago`;
    if (diff < 7 * 24 * 60 * minute) return `${Math.floor(diff / (24 * 60 * minute))}d ago`;
    return new Date(timestamp).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
};

export const fileNameFromContent = (content: string) => {
    const firstLine = content.trim().split("\n")[0] ?? "";
    const slug = firstLine
        .replace(/^[#>*\-\s]+/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40);
    const isMarkdown = /^(#{1,6} |[-*] |```)/m.test(content);
    return `${slug || "note"}.${isMarkdown ? "md" : "txt"}`;
};

export const handleDownload = (value: string, fileName = fileNameFromContent(value), mimeType = "") => {
    const file = new Blob([value], { type: mimeType || "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    // Revoke after the click has been processed, otherwise some browsers cancel the download.
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    return fileName;
};
