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
      const response = await fetch("http://localhost:3000/storeData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uniqueId: randomId,
          ...formDataObject,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        console.log(json.message);

        const uniqueId = json.uniqueId;
        window.location.href = `confirm.html?id=${uniqueId}`;
        console.log(uniqueId);
      }
    });
  }

  // Track Delivery Form
  const trackForm = document.getElementById("trackForm");
  const selectedShipmentData = document.getElementById("selectedShipmentData");

  if (trackForm) {
    trackForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const trackingNumber = document.getElementById("trackingNumber").value;

      // Send tracking number to server for fetching data
      const url = `http://localhost:3000/getData?uniqueId=${trackingNumber}`;
      console.log("Constructed URL:", url); // Log the URL
      const response = await fetch(url);
      // const response = await fetch(`/getData?uniqueId=${trackingNumber}`);
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

          if (selectedShipmentData) {
            selectedShipmentData.innerHTML = dataMarkup; // Display the data in the selectedShipmentData element
          } else {
            // Handle the case where selectedShipmentData is not available
          }
        }
      } else {
        console.error("Error fetching tracking data:", response.statusText);
      }
    });
  }

  // Update Status Button
  const updateStatusButton = document.getElementById("updateStatusButton");

  if (updateStatusButton) {
    updateStatusButton.addEventListener("click", async () => {
      const uniqueIdToUpdate = document.getElementById("trackingNumber").value;
      const newStatus = document.querySelector(
        'input[name="newStatus"]:checked'
      ).value;

      // Send status update request to server
      const updateResponse = await fetch("/updateStatus", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uniqueId: uniqueIdToUpdate,
          newStatus: newStatus,
        }),
      });

      if (updateResponse.ok) {
        console.log("Status updated successfully");
        // Handle success, update UI or show a success message
      } else {
        console.error("Error updating status:", updateResponse.statusText);
        // Handle error, display an error message to the user
      }
    });
  }
  const urlParams = new URLSearchParams(window.location.search);
  const uniqueId = urlParams.get("id");
  const uniqueIdElement = document.getElementById("uniqueId");

  if (uniqueIdElement) {
    // Check if uniqueIdElement is not null
    if (uniqueId) {
      uniqueIdElement.textContent = uniqueId;
    } else {
      uniqueIdElement.textContent = "Unknown";
    }
  }
});
