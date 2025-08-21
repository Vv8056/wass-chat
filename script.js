// document.addEventListener("DOMContentLoaded", function () {
//   fetch('chat.json')
//     .then(response => response.json())
//     .then(data => renderChat(data))
//     .catch(error => console.error("Error loading chat:", error));
// });

// function renderChat(messages) {
//   const container = document.getElementById("chat-container");
//   container.innerHTML = "";

//   // Sort messages by date
//   messages.sort((a, b) => a.date - b.date);

//   let lastDate = "";
//   messages.forEach(msg => {
//     const messageDate = new Date(msg.date * 1000);
//     const dateString = messageDate.toLocaleDateString("en-GB", {
//       day: "numeric", month: "long", year: "numeric"
//     });
//     const timeString = messageDate.toLocaleTimeString("en-US", {
//       hour: "2-digit", minute: "2-digit", hour12: true
//     });

//     // Add date divider if date changes
//     if (dateString !== lastDate) {
//       const dateDivider = document.createElement("div");
//       dateDivider.className = "date-divider";
//       dateDivider.textContent = dateString;
//       container.appendChild(dateDivider);
//       lastDate = dateString;
//     }

//     // Message wrapper
//     const wrapper = document.createElement("div");
//     wrapper.className = "message-wrapper";

//     // Message element
//     const messageEl = document.createElement("div");
//     messageEl.className = `message ${msg.author === "माँ का आशीर्वाद 3333" ? "message-right" : "message-left"}`;

//     // Handle different message types
//     if (msg.type === "text") {
//       messageEl.textContent = msg.text;
//     } else if (msg.type === "image") {
//       const img = document.createElement("img");
//       img.src = `assets/${msg.uri}`;
//       img.className = "chat-img";
//       img.alt = "Image message";
//       messageEl.appendChild(img);
//     } else if (msg.type === "video") {
//       const video = document.createElement("video");
//       video.src = `assets/${msg.uri}`;
//       video.className = "chat-video";
//       video.controls = true;
//       messageEl.appendChild(video);
//     } else if (msg.type === "link") {
//       const linkPreview = document.createElement("div");
//       linkPreview.className = "link-preview";

//       const title = document.createElement("strong");
//       title.textContent = msg.title;

//       const br = document.createElement("br");

//       const url = document.createElement("small");
//       url.textContent = msg.url;

//       linkPreview.appendChild(title);
//       linkPreview.appendChild(br);
//       linkPreview.appendChild(url);

//       messageEl.appendChild(linkPreview);
//     }

//     // Timestamp
//     const timestamp = document.createElement("span");
//     timestamp.className = "timestamp";
//     timestamp.textContent = timeString;
//     messageEl.appendChild(timestamp);

//     wrapper.appendChild(messageEl);
//     container.appendChild(wrapper);
//   });

//   // Scroll to bottom
//   container.scrollTop = container.scrollHeight;
// }


document.addEventListener("DOMContentLoaded", function () {
  fetch('chat.json')
    .then(response => response.json())
    .then(data => initChat(data))
    .catch(error => console.error("Error loading chat:", error));
});

let allMessages = [];
let chunkSize = 20;
let currentIndex = 0;

function initChat(data) {
  // Sort ascending (oldest → newest)
  allMessages = data.sort((a, b) => a.date - b.date);

  // Start at first chunk
  currentIndex = 0;
  renderChat(allMessages.slice(currentIndex, currentIndex + chunkSize), false);

  setupScrollListener();
}

function renderChat(messages, append = true) {
  const container = document.getElementById("chat-container");

  if (!append) container.innerHTML = ""; // only clear once

  let lastDate = container.dataset.lastDate || "";

  messages.forEach(msg => {
    const messageDate = new Date(msg.date * 1000);
    const dateString = messageDate.toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric"
    });
    const timeString = messageDate.toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", hour12: true
    });

    // Insert date divider when date changes
    if (dateString !== lastDate) {
      const dateDivider = document.createElement("div");
      dateDivider.className = "date-divider";
      dateDivider.textContent = dateString;
      container.appendChild(dateDivider);
      lastDate = dateString;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "message-wrapper";

    const messageEl = document.createElement("div");
    messageEl.className = `message ${msg.author === "माँ का आशीर्वाद 3333" ? "message-right" : "message-left"}`;

    if (msg.type === "text") {
      messageEl.textContent = msg.text;
    } else if (msg.type === "image") {
        // Split file and caption
        const [imageFile, ...captionParts] = msg.uri.split("\n");
        const captionText = captionParts.join("\n").trim();

        const img = document.createElement("img");
        img.src = `assets/${imageFile.trim()}`;
        img.className = "chat-img";
        img.alt = "Image message";
        // Add click event to open popup
        img.addEventListener("click", () => openImagePopup(img.src, captionText));
        messageEl.appendChild(img);

        // If caption exists, show it
        if (captionText) {
          const caption = document.createElement("div");
          caption.className = "image-caption";
          caption.textContent = captionText;
          messageEl.appendChild(caption);
        }
    //else if (msg.type === "image") {
    //   const img = document.createElement("img");
    //   img.src = `assets/${msg.uri}`;
    //   img.className = "chat-img";
    //   img.alt = "Image message";
    //   messageEl.appendChild(img);
      } else if (msg.type === "video") {
        // Split video uri and caption if exists
        const [videoFile, ...captionParts] = msg.uri.split("\n");
        const captionText = captionParts.join("\n").trim();

        const video = document.createElement("video");
        video.src = `assets/${videoFile.trim()}`;
        video.className = "chat-video";
        video.controls = true;
        messageEl.appendChild(video);

        // If there's a caption, show it below the video
        if (captionText) {
          const caption = document.createElement("div");
          caption.className = "video-caption";
          caption.textContent = captionText;
          messageEl.appendChild(caption);
        }

    // } else if (msg.type === "video") {
    //   const video = document.createElement("video");
    //   video.src = `assets/${msg.uri}`;
    //   video.className = "chat-video";
    //   video.controls = true;
    //   messageEl.appendChild(video);
    } else if (msg.type === "link") {
      const linkPreview = document.createElement("div");
      linkPreview.className = "link-preview";

      const title = document.createElement("strong");
      title.textContent = msg.title;

      const br = document.createElement("br");

      const url = document.createElement("small");
      url.textContent = msg.url;

      linkPreview.appendChild(title);
      linkPreview.appendChild(br);
      linkPreview.appendChild(url);

      messageEl.appendChild(linkPreview);
    }

    const timestamp = document.createElement("span");
    timestamp.className = "timestamp";
    timestamp.textContent = timeString;
    messageEl.appendChild(timestamp);

    wrapper.appendChild(messageEl);
    container.appendChild(wrapper);
  });

  // Save last date to dataset (so dividers are correct when appending)
  container.dataset.lastDate = lastDate;

  if (!append) {
    // Scroll to top on first render (because we load oldest first)
    container.scrollTop = 0;
  }
}

function setupScrollListener() {
  const container = document.getElementById("chat-container");

  container.addEventListener("scroll", function () {
    // If user is near bottom
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
      // Load next chunk
      const nextIndex = currentIndex + chunkSize;
      if (nextIndex < allMessages.length) {
        const newMessages = allMessages.slice(nextIndex, nextIndex + chunkSize);
        currentIndex = nextIndex;
        renderChat(newMessages, true);
      }
    }
  });
}

function openImagePopup(src, captionText) {
  const popup = document.getElementById("image-popup");
  const popupImg = document.getElementById("popup-img");
  const popupCaption = document.getElementById("popup-caption");

  popup.style.display = "block";
  popupImg.src = src;
  popupCaption.textContent = captionText || "";
}

// Close on click X
document.querySelector(".popup-close").addEventListener("click", () => {
  document.getElementById("image-popup").style.display = "none";
});

// Close on background click
document.getElementById("image-popup").addEventListener("click", (e) => {
  if (e.target.id === "image-popup") {
    e.target.style.display = "none";
  }
});

