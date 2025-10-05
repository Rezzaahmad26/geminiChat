const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const sendButton = form.querySelector("button");

// This array will store the entire conversation history.
let conversation = [];

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // 1. Add user message to conversation and display it
  const userMessageObject = { role: "user", text: userMessage };
  conversation.push(userMessageObject);
  appendMessage("user", userMessage);
  input.value = "";
  input.focus();
  setLoading(true);

  try {
    // 2. Send the entire conversation to the backend
    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ conversation }),
    });

    const result = await response.json();

    if (result.success) {
      // 3. Add model's response to conversation and display it
      const modelMessageObject = { role: "model", text: result.data };
      conversation.push(modelMessageObject);
      appendMessage("model", result.data);
    } else {
      appendMessage("model", `Error: ${result.message}`);
    }
  } catch (error) {
    console.error("Error fetching chat response:", error);
    appendMessage(
      "model",
      "Sorry, something went wrong while connecting to the server."
    );
  } finally {
    setLoading(false);
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender === "user" ? "user" : "bot");
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function setLoading(isLoading) {
  sendButton.disabled = isLoading;
  input.disabled = isLoading;
  sendButton.textContent = isLoading ? "..." : "Send";
}
