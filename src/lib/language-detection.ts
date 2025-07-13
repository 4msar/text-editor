// Types for language names used in detection and styling
export type LanguageName =
    | "javascript"
    | "typescript"
    | "python"
    | "java"
    | "c"
    | "c++"
    | "c#"
    | "ruby"
    | "php"
    | "go"
    | "rust"
    | "swift"
    | "kotlin"
    | "dart"
    | "shell"
    | "html"
    | "css"
    | "scss"
    | "json"
    | "markdown"
    | "sql"
    | "plaintext"; // Default for unrecognized languages

// Tailwind CSS color mapping for each language (light + dark in one string)
export const languageColorClasses: Record<LanguageName, string> = {
    javascript: "text-yellow-600 dark:text-yellow-400",
    typescript: "text-blue-600 dark:text-blue-400",
    python: "text-blue-700 dark:text-yellow-300",
    java: "text-red-700 dark:text-red-400",
    c: "text-blue-800 dark:text-blue-300",
    "c++": "text-blue-800 dark:text-blue-300",
    "c#": "text-purple-700 dark:text-purple-400",
    ruby: "text-red-600 dark:text-red-400",
    php: "text-indigo-700 dark:text-indigo-300",
    go: "text-cyan-700 dark:text-cyan-400",
    rust: "text-orange-800 dark:text-orange-400",
    swift: "text-orange-600 dark:text-orange-400",
    kotlin: "text-purple-600 dark:text-purple-300",
    dart: "text-sky-700 dark:text-sky-400",
    shell: "text-green-700 dark:text-green-400",
    html: "text-orange-700 dark:text-orange-400",
    css: "text-blue-500 dark:text-blue-300",
    scss: "text-pink-700 dark:text-pink-400",
    json: "text-gray-700 dark:text-gray-300",
    markdown: "text-gray-600 dark:text-gray-400",
    sql: "text-indigo-600 dark:text-indigo-400",
    plaintext: "text-neutral-900 dark:text-neutral-200", // Default for unrecognized languages
};

// Language detection patterns
export const languages: { name: LanguageName; pattern: RegExp }[] = [
    {
        name: "javascript",
        pattern:
            /(?:\b(?:function|var|let|const|if|else|for|while|return|class|import|export|<script)\b)/i,
    },
    {
        name: "typescript",
        pattern:
            /(?:\b(?:interface|type|implements|enum|as|from\s+['"][^'"]+['"];?|import\s+type)\b)/i,
    },
    {
        name: "python",
        pattern:
            /(?:\b(?:def |import |from |print\(|self|elif|except|lambda|with |as |class )\b)/,
    },
    {
        name: "java",
        pattern:
            /(?:\b(?:public |private |protected |static |void |class |interface |implements |extends |new |package |import )\b)/,
    },
    {
        name: "c",
        pattern:
            /(?:\b(?:#include <stdio\.h>|int main\s*\(|printf\(|scanf\(|#define|typedef|struct )\b)/,
    },
    {
        name: "c++",
        pattern:
            /(?:\b(?:#include <iostream>|std::|cout|cin|new |delete |class |template |typename|::)\b)/,
    },
    {
        name: "c#",
        pattern:
            /(?:\b(?:using System|namespace |public |private |protected |class |void |static |new |override |async |await|var |Console\.WriteLine)\b)/,
    },
    {
        name: "ruby",
        pattern:
            /(?:\b(?:def |end|class |module |puts |require |attr_accessor|unless|elsif|yield|begin|rescue)\b)/,
    },
    {
        name: "php",
        pattern:
            /(?:<\?php|echo |->|function |public |private |protected |\$[a-zA-Z_][a-zA-Z0-9_]*|use |namespace )/i,
    },
    {
        name: "go",
        pattern:
            /(?:\b(?:package |import |func |fmt\.|go |chan |defer |struct |interface |map\[)\b)/,
    },
    {
        name: "rust",
        pattern:
            /(?:\b(?:fn |let |mut |pub |impl |trait |enum |use |mod |crate::|::)\b)/,
    },
    {
        name: "swift",
        pattern:
            /(?:\b(?:import |func |let |var |class |struct |protocol |extension |guard |defer|if let|as\?|as!|try |catch )\b)/,
    },
    {
        name: "kotlin",
        pattern:
            /(?:\b(?:fun |val |var |class |object |companion |data class|sealed class|interface|when |is |as |import )\b)/,
    },
    {
        name: "dart",
        pattern:
            /(?:\b(?:import |class |void |final |var |dynamic|@override|async |await|Future<|Stream<|new )\b)/,
    },
    {
        name: "html",
        pattern:
            /(?:<!DOCTYPE html>|<html[\s>]|<body[\s>]|<div[\s>]|<span[\s>]|<head[\s>]|<meta[\s>]|<title[\s>])/i,
    },
    {
        name: "css",
        pattern:
            /(?:\b(?:[.#]?[a-zA-Z0-9_-]+\s*\{|\:[a-zA-Z-]+\s?:|\@[a-zA-Z]+\s))/,
    },
    {
        name: "scss",
        pattern:
            /(?:\b(?:\$[a-zA-Z0-9_-]+:|@mixin |@include |@extend |&:|#{|\s{2,}\{))/,
    },
    {
        name: "json",
        pattern:
            /(?:^\s*{[\s\S]*}\s*$|^\s*\[[\s\S]*]\s*$|"(?:\\.|[^"\\])*"\s*:)/,
    },
    {
        name: "markdown",
        pattern:
            /(?:^(#|##|###|####|#####|######)\s|^\s*[-*+]\s|!\[.*\]\(.*\)|\*{1,2}[^*]+\*{1,2}|`{1,3}[^`]+`{1,3})/m,
    },
    {
        name: "sql",
        pattern:
            /(?:\b(?:SELECT |INSERT INTO |UPDATE |DELETE FROM |CREATE TABLE |ALTER TABLE |DROP TABLE |WHERE |JOIN |ON |GROUP BY|ORDER BY)\b)/i,
    },
    {
        name: "shell",
        pattern:
            /(?:\b(?:#!\/bin\/bash|echo |if |then |else |fi |for |while |do |done |function |export |alias )\b)/i,
    },
];

// Utility: detect language from code snippet
export function detectLanguage(code: string): LanguageName | undefined {
    return languages.find((lang) => lang.pattern.test(code))?.name;
}

// Utility: get Tailwind CSS classes for a detected language
export function getLanguageClass(language: LanguageName): string {
    return `${
        languageColorClasses[language] || languageColorClasses.plaintext
    } ${language}`;
}
