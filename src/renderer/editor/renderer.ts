/*
This file will automatically be loaded by webpack and run in the "renderer" context.
 */

// * Imports *

import "../style.scss";
import * as monaco from "monaco-editor";
import monacoConfig from "./monaco-config";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

// * Variable assignment *

const body = document.body;
const darkModeIcon = document.getElementById("dark-mode-icon");
const darkModeToggle = document.getElementById("toggle-dark-mode");
const editorPane = document.getElementById("editor-pane");
const shellPane = document.getElementById("shell-pane");
const navbar = document.querySelector(".navbar");
const openFileButton = document.getElementById("open-file-btn");
const runFileButton = document.getElementById("run-file-btn");
const openDocsButton = document.getElementById("open-docs-btn");
const openDocsOverviewButton = document.getElementById(
  "open-docs-overview-btn"
);
const openDocsElementsButton = document.getElementById(
  "open-docs-elements-btn"
);
const openDocsComponentsButton = document.getElementById(
  "open-docs-components-btn"
);
const fileDirItem = document.getElementById("file-dir-item");
const fileDirName = document.getElementById("file-dir");
const titleBar = document.getElementsByTagName("title")[0];

const editor = monaco.editor.create(editorPane, monacoConfig);
const shell = new Terminal();
const fitAddon = new FitAddon();

let filePath: string;
let fileName = "Untitled";
let isFileOpen = false;
let originalContent = "";

shell.loadAddon(fitAddon);
// Attaching xterm.js to the DOM
shell.open(shellPane);
fitAddon.fit();

// * Functions *

function toggleDarkMode() {
  navbar.classList.toggle("is-light");
  navbar.classList.toggle("is-dark");
  darkModeToggle.classList.toggle("is-light");
  darkModeToggle.classList.toggle("is-dark");
  darkModeIcon.classList.toggle("fa-moon");
  darkModeIcon.classList.toggle("fa-sun");
  body.classList.toggle("is-dark");

  if (darkModeIcon.classList.contains("fa-sun")) {
    monaco.editor.setTheme("vs-dark");
  } else {
    monaco.editor.setTheme("vs");
  }
}

function renderFile(file: string, fileDir: string, content: string) {
  filePath = `${fileDir}/${file}`;
  fileName = file;
  isFileOpen = true;
  fileDirName.innerHTML = fileDir;
  openFileButton.classList.toggle("hidden");
  fileDirItem.classList.toggle("hidden");
  editor.setValue(content);
  originalContent = content;
  updateUI(false);
}

function updateUI(isEdited: boolean) {
  let title = "";
  if (isEdited) {
    title = `${fileName} - Edited`;
  } else {
    title = `${fileName}`;
  }

  titleBar.innerHTML = title;
}

function isEdited() {
  const currentContent = editor.getValue();
  return currentContent !== originalContent;
}

// * Event Listeners *

editorPane.addEventListener("keyup", () => updateUI(isEdited()));

darkModeToggle.addEventListener("click", window.api.darkMode.toggle.send);

openFileButton.addEventListener("click", () => {
  window.api.file.fetch(isEdited());
});

runFileButton.addEventListener("click", () => {
  window.api.file.run(filePath, editor.getValue());
});

openDocsButton.addEventListener("click", window.api.docs.open);

openDocsOverviewButton.addEventListener("click", () => {
  window.api.docs.open("overview");
});

openDocsElementsButton.addEventListener("click", () => {
  window.api.docs.open("elements");
});

openDocsComponentsButton.addEventListener("click", () => {
  window.api.docs.open("components");
});

shell.onData((data) => {
  window.api.shell.stdin(data);
});

window.addEventListener("resize", () => fitAddon.fit());

// * API Listeners *

window.api.file.open(
  (
    _event: Electron.IpcRendererEvent,
    file: string,
    fileDir: string,
    content: string
  ) => {
    renderFile(file, fileDir, content);
  }
);

window.api.file.initRun(() => {
  window.api.file.run(filePath, editor.getValue());
});

window.api.file.isEdited((event: Electron.IpcRendererEvent) => {
  event.sender.send("file:is-edited", isEdited());
});

window.api.file.isOpen((event: Electron.IpcRendererEvent) => {
  event.sender.send("file:is-open", isFileOpen);
});

window.api.shell.stdout((_event: Electron.IpcRendererEvent, data: string) => {
  shell.write(data);
});

window.api.shell.clear(() => {
  shell.reset();
});

window.api.file.save((event: Electron.IpcRendererEvent) => {
  event.sender.send("file:save", filePath, editor.getValue());
});

window.api.title.update(() => {
  originalContent = editor.getValue();
  updateUI(false);
});

window.api.file.show((event: Electron.IpcRendererEvent) => {
  event.sender.send("file:show", filePath);
});

window.api.darkMode.toggle.receive(toggleDarkMode);

window.api.platform.notDarwin(() => (body.id = "not-darwin"));
