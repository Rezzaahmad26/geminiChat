// === GEMINI AI CHATBOT SCRIPT ===
// Maintains chat conversation with backend endpoint `/chat`
// Uses modern ES6 practices and a clean UI structure

// === DOM References ===
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const messagesContainer = document.getElementById("messages-container");
const sendButton = form.querySelector("button");

// === Create Clear Chat Button ===
const clearButton = document.createElement("button");
clearButton.textContent = "Clear Chat";
clearButton.classList.add("clear-btn");
chatBox.appendChild(clearButton);
clearButton.style.display = "none"; // hidden until messages appear

// === State ===
let conversation = [];
let isLoading = false;

// === Event: Submit Message ===
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage || isLoading) return;

  addMessage("user", userMessage);
  conversation.push({ role: "user", text: userMessage });
  input.value = "";
  input.focus();

  await fetchChatResponse();
});

// === Event: Clear Chat ===
clearButton.addEventListener("click", () => {
  conversation = [];
  messagesContainer.innerHTML = "";
  clearButton.style.display = "none";
});

// === Fetch Response from Backend ===
async function fetchChatResponse() {
  setLoading(true);
  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation }),
    });

    const result = await response.json();

    if (result.success) {
      const reply = result.data;
      conversation.push({ role: "model", text: reply });
      addMessage("bot", reply);
    } else {
      addMessage("bot", `⚠️ Error: ${result.message}`);
    }
  } catch (err) {
    console.error("Error fetching chat response:", err);
    addMessage(
      "bot",
      "⚠️ Sorry, something went wrong while connecting to the server."
    );
  } finally {
    setLoading(false);
  }
}

// === Add Message to Chat Box ===
function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender === "user" ? "user" : "bot");
  msg.textContent = text;

  // Animate appearance
  msg.style.opacity = "0";
  msg.style.transform = "translateY(10px)";
  messagesContainer.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;

  requestAnimationFrame(() => {
    msg.style.transition = "all 0.3s ease";
    msg.style.opacity = "1";
    msg.style.transform = "translateY(0)";
  });

  // Show Clear Chat button if hidden
  clearButton.style.display = "block";
}

// === Loading UI State ===
function setLoading(state) {
  isLoading = state;
  sendButton.disabled = state;
  input.disabled = state;
  sendButton.textContent = state ? "..." : "Send";

  if (state) showTypingIndicator();
  else removeTypingIndicator();
}

// === Typing Indicator ===
function showTypingIndicator() {
  removeTypingIndicator(); // prevent duplicates
  const indicator = document.createElement("div");
  indicator.classList.add("message", "bot", "typing-indicator");
  indicator.innerHTML = `<span></span><span></span><span></span>`;
  messagesContainer.appendChild(indicator);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
  const existing = chatBox.querySelector(".typing-indicator");
  if (existing) existing.remove();
}
