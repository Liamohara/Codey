/*
This file will automatically be loaded by webpack and run in the "renderer" context.
 */

// * Imports *

import "../style.scss";

// * Variable assignment *

const body = document.body;
const darkModeIcon = document.getElementById("dark-mode-icon");
const darkModeToggle = document.getElementById("toggle-dark-mode");
const navbar = document.querySelector(".navbar");

// * Functions *

function toggleDarkMode() {
  navbar.classList.toggle("is-light");
  navbar.classList.toggle("is-dark");
  darkModeToggle.classList.toggle("is-light");
  darkModeToggle.classList.toggle("is-dark");
  darkModeIcon.classList.toggle("fa-moon");
  darkModeIcon.classList.toggle("fa-sun");
  body.classList.toggle("is-dark");
}

// * Event Listeners *

darkModeToggle.addEventListener("click", window.api.darkMode.toggle.send);

// * API Listeners *

window.api.docs.jump((_event: Electron.IpcRendererEvent, section: string) => {
  window.location.hash = null;
  window.location.hash = section;
});

window.api.darkMode.toggle.receive(toggleDarkMode);

window.api.platform.notDarwin(() => (body.id = "not-darwin"));
