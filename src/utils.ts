export const formatDate = (date: Date): string => {
    // expected format: "Wed, 03 Jul, 12:00 AM"
    const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    };
    return date.toLocaleDateString("en-US", options);
};
