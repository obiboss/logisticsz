"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const trackForm = document.getElementById("trackForm");

  if (trackForm) {
    trackForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(trackForm);
      const uniqueId = formData.get("id");

      if (uniqueId) {
        window.location.href = `track-delivery.html?id=${uniqueId}`;
      }
    });
  }
});
