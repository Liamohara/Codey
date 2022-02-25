/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 */

// * Imports *

import "../style.scss";

// * Variable assignment *

const body = document.body;
const darkModeIcon = document.getElementById("dark-mode-icon");
const darkModeToggle = document.getElementById("toggle-dark-mode");
("open-docs-btn");
const titleBar = document.getElementsByTagName("title")[0];
const navbar = document.querySelector(".navbar");
const title = document.querySelector(".title");

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

darkModeToggle.addEventListener("click", window.api.toggleDarkMode.send);

// * API Listeners *

window.api.jump((event, content) => {
  window.location.hash = null;
  window.location.hash = content;
});

window.api.toggleDarkMode.recieve(toggleDarkMode);

window.api.file.isOpen.get(() => {
  window.api.file.isOpen.send(true);
});
