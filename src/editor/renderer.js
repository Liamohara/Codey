/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 */

// * Imports *

import "../style.scss";
const monaco = require("monaco-editor");
const monacoConfig = require("./monaco-config");
const { Terminal } = require("xterm");
const { FitAddon } = require("xterm-addon-fit");

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

let filePath = null;
let fileName = "Untitled";
let isFileOpen = false;
let originalContent = "";

shell.loadAddon(fitAddon);
// Attaching xterm.js to the DOM
shell.open(shellPane);
fitAddon.fit();

window.api.os.get();
window.api.os.recieve((event, os) => {
  if (os === "win32") {
    const shellViewport = document.querySelector(".xterm-viewport");
    shellViewport.classList.toggle("disable-scrollbar");
  }
});

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

function renderFile(file, fileDir, content) {
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

function updateUI(isEdited) {
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

editorPane.addEventListener("keyup", () => {
  updateUI(isEdited());
});

darkModeToggle.addEventListener("click", window.api.toggleDarkMode.send);

openFileButton.addEventListener("click", () => {
  window.api.file.open(isEdited());
});

runFileButton.addEventListener("click", () => {
  window.api.file.run.send(filePath, editor.getValue());
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
  window.api.shell.send(data);
});

window.addEventListener("resize", () => fitAddon.fit());

// * API Listeners *

window.api.file.recieve((event, file, fileDir, content) => {
  renderFile(file, fileDir, content);
});

window.api.file.isEdited.get(() => {
  window.api.file.isEdited.send(isEdited());
});

window.api.file.isOpen.get(() => {
  window.api.file.isOpen.send(isFileOpen);
});

window.api.shell.recieve((event, data) => {
  shell.write(data);
});

window.api.shell.clear(() => {
  shell.clear();
});

window.api.file.save.get(() => {
  window.api.file.save.send(filePath, editor.getValue());
});

window.api.file.run.get(() => {
  window.api.file.run.send(filePath, editor.getValue());
});

window.api.title.update(() => {
  originalContent = editor.getValue();
  updateUI(false);
});

window.api.file.show.get(() => {
  window.api.file.show.send(filePath);
});

window.api.toggleDarkMode.recieve(toggleDarkMode);
