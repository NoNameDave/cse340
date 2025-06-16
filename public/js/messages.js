document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("openMessageConsole");
  const messagePanel = document.getElementById("message-console");
  const sendBtn = document.getElementById("sendMessageBtn");
  const recipientSelect = document.getElementById("recipientSelect");
  const messageText = document.getElementById("messageInput");
  const messageContainer = document.getElementById("messageContainer");

  let isOpen = false;

  toggleBtn?.addEventListener("click", () => {
    isOpen = !isOpen;
    messagePanel.classList.toggle("show", isOpen);
    messagePanel.classList.toggle("hidden", !isOpen);

    if (isOpen) {
      loadUsers();
      fetch("/messages/mark-read", { method: "POST" });
    }
  });

  async function loadUsers() {
    try {
      const res = await fetch("/messages/users");
      const data = await res.json();

      recipientSelect.innerHTML = "<option disabled selected value=''>-- Select a user --</option>";

      if (!Array.isArray(data.users) || data.users.length === 0) {
        recipientSelect.innerHTML += "<option disabled>No other users found</option>";
        return;
      }

      data.users.forEach(user => {
        const option = document.createElement("option");
        option.value = user.account_id;
        option.textContent = `${user.account_firstname} ${user.account_lastname}`;
        recipientSelect.appendChild(option);
      });
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  }

  async function loadMessages(recipientId) {
    try {
      const res = await fetch("/messages/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient_id: recipientId }),
      });      
      const data = await res.json();

      if (data.success && Array.isArray(data.messages)) {
        displayMessages(data.messages);
      } else {
        messageContainer.innerHTML = "<p>No messages found.</p>";
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      messageContainer.innerHTML = "<p>Error loading messages.</p>";
    }
  }

  function displayMessages(messages) {
    console.log("Displaying messages:", messages); // ✅ Add this

    const wrapper = document.getElementById("messageThreadWrapper");
    const container = document.getElementById("messageContainer");

    if (!messages || messages.length === 0) {
      wrapper.style.display = "none";
      return;
    }

    container.innerHTML = "";
    wrapper.style.display = "block";

    messages.forEach(msg => {
      const div = document.createElement("div");
      div.className = "message";
      const time = new Date(msg.sent_at).toLocaleString(); // Format the timestamp
      div.innerHTML = `<strong>${msg.sender_name}</strong> <em>${time}</em><br>${msg.message_text}`;
      container.appendChild(div);
    });
  }

  recipientSelect?.addEventListener("change", () => {
    const recipientId = recipientSelect.value;
    if (recipientId) {
      loadMessages(recipientId);
    } else {
      messageContainer.innerHTML = "<p>Select a user to see messages.</p>";
    }
  });

  sendBtn?.addEventListener("click", async () => {
    const recipient = recipientSelect.value;
    const text = messageText.value.trim();

    if (!recipient || !text) {
      alert("Please select a user and enter your message.");
      return;
    }

    try {
      const res = await fetch("/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_id: recipient,
          message_text: text
        })
      });

      const result = await res.json();

      if (result.success) {
        messageText.value = "";
        loadMessages(recipient); // Refresh messages
      } else {
        alert("Failed to send the message.");
      }
    } catch (err) {
      console.error("Send failed:", err);
    }
  });
});