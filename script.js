"use strict";

// Function to generate a random ID
function generateRandomId(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    id += characters.charAt(randomIndex);
  }

  return id;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".shipmentForm");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const formDataObject = Object.fromEntries(formData);

      const randomId = generateRandomId(7); // Generating unique ID here

      // Send data to server for storage
      const response = await fetch("/storeData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uniqueId: randomId,
          ...formDataObject,
        }),
      });
      console.log("Form Data:", JSON.stringify(formDataObject));

      if (response.ok) {
        const json = await response.json();
        console.log(json.message);

        const uniqueId = json.uniqueId;
        window.location.href = `confirm.html?id=${uniqueId}`;
      }
    });
  }

  // Track Delivery Form
  const trackForm = document.getElementById("trackForm");

  if (trackForm) {
    trackForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const trackingNumber = document.getElementById("trackingNumber").value;

      // Send tracking number to server for fetching data
      const response = await fetch(`/getData?uniqueId=${trackingNumber}`);
      if (response.ok) {
        const parsedData = await response.json();
        console.log("Fetched Tracking Data:", parsedData);

        // Display or handle the fetched data as needed
        const trackedDataElement = document.getElementById("trackedData");
        if (trackedDataElement) {
          const keys = Object.keys(parsedData);
          const dataMarkup = keys
            .map(
              (key) => `
              <div>
                  <strong>${key}:</strong> ${parsedData[key]}
              </div>
            `
            )
            .join("");

          trackedDataElement.innerHTML = dataMarkup;
        }
      } else {
        console.error("Error fetching tracking data:", response.statusText);
      }
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const uniqueId = urlParams.get("id");

  // Check if we're on the confirmation page
  if (window.location.pathname.includes("confirm.html")) {
    const uniqueIdElement = document.getElementById("uniqueId");

    if (uniqueIdElement && uniqueId) {
      uniqueIdElement.textContent = uniqueId;
    } else {
      uniqueIdElement.textContent = "Unknown";
    }
  }
});
