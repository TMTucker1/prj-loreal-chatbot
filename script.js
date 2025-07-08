/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";
// Cloudflare Workers: Handle CORS and API key securely
const workerUrl = "aged-poetry-c41e.tmtucke2.workers.dev";

// Function to add a message to the chat window
function addMessage(text, sender) {
  // Create a new div for the message
  const msgDiv = document.createElement("div");
  msgDiv.className = `msg ${sender}`;
  msgDiv.textContent = text;
  chatWindow.appendChild(msgDiv);
  // Scroll to the bottom
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Function to call OpenAI API
async function getAIResponse(userMessage) {
  // The data we send to the Cloudflare Worker
  const data = {
    model: "gpt-4o", // Use the gpt-4o model
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: userMessage },
    ],
  };

  try {
    // Make the API request using fetch and async/await
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Parse the response as JSON
    const result = await response.json();

    // Get the AI's reply from the response
    const aiMessage = result.choices && result.choices[0].message.content;
    return aiMessage || "Sorry, I didn't understand that.";
  } catch (error) {
    // If there is an error, show a message
    return "Error: Unable to connect to the Cloudflare Worker.";
  }
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  // Show user's message
  addMessage(message, "user");
  userInput.value = "";

  // Show loading message
  addMessage("Thinking...", "ai");

  // Get AI response
  const aiReply = await getAIResponse(message);

  // Remove the loading message
  const loadingMsg = chatWindow.querySelector(".msg.ai:last-child");
  if (loadingMsg && loadingMsg.textContent === "Thinking...") {
    chatWindow.removeChild(loadingMsg);
  }

  // Show AI's reply
  addMessage(aiReply, "ai");
});
