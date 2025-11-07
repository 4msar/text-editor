export const keyboardShortcuts = [
    "Press `cmd + o` to open file.",
    "Press `cmd + s` to save file as text.",
    "Press `cmd + ,` to open settings dialog.",
    "Press `cmd + /` to open help dialog.",
    "Press `cmd + b` for bold.",
    "Press `cmd + i` for italic.",
    "Press `cmd + u` for underline.",
    "Press `cmd + k` for link.",
    "Press `cmd + shift + l` for convert text to lowercase.",
    "Press `cmd + shift + l` for convert text to uppercase.",
]

export const placeholderTexts = [
    "Start writing...\n",
    ...keyboardShortcuts.slice(0,3),
    "You can also drag and drop files here.\n",
]

export const helpTexts = [
    "Keyboard Shortcuts:\n",
    ...keyboardShortcuts,
    "\n",
    "This app also supports PWA installation. You can install it on your device and use it offline.",
]