import { Marked } from "marked";

const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Notes can come from dropped/opened files, so treat the source as untrusted:
// raw HTML is shown as text and only safe URL schemes are allowed in links/images.
const SAFE_URL = /^(https?:|mailto:|tel:|#|\/|\.\.?\/|[^:]*$)/i;
const safeUrl = (href: string) => (SAFE_URL.test(href.trim()) ? href : "#");

const marked = new Marked({
    gfm: true,
    breaks: true,
    renderer: {
        html: ({ text }) => escapeHtml(text),
        link({ href, title, tokens }) {
            const text = this.parser.parseInline(tokens);
            const t = title ? ` title="${escapeHtml(title)}"` : "";
            return `<a href="${escapeHtml(safeUrl(href))}"${t} target="_blank" rel="noopener noreferrer">${text}</a>`;
        },
        image({ href, title, text }) {
            const t = title ? ` title="${escapeHtml(title)}"` : "";
            return `<img src="${escapeHtml(safeUrl(href))}" alt="${escapeHtml(text)}"${t} loading="lazy">`;
        },
    },
});

export const renderMarkdown = (source: string) => marked.parse(source, { async: false });
