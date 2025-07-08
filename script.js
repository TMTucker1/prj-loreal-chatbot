/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent =
  "👋 Hello! How can I help you feel your most confident today?";
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
      {
        role: "system",
        content:
          "YYou are a beauty expert representing L’Oréal. Your sole purpose is to help users discover and choose the right L’Oréal products across all categories (haircare, skincare, makeup, etc.), as well as provide personalized routines and recommendations. Speak in an elegant, empowering, and inclusive tone. Be warm, knowledgeable, and supportive—like a trusted beauty advisor. Do not answer unrelated questions. Stay focused on helping the user find the ideal L’Oréal product based on their needs, preferences, and goals.",
      },
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

/* Generate a random loading message */
function getRandomLoadingMessage() {
  const loadingMessages = [
    "Perfecting your beauty match…",
    "Bringing beauty to your fingertips…",
    "Curating your ideal L’Oréal picks…",
    "Finding formulas made for you…",
    "Your personalized beauty routine is on its way…",
    "Blending innovation and beauty—just a moment…",
    "Let’s find what makes you feel unstoppable…",
  ];
  return loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  // Show user's message
  addMessage(message, "user");
  userInput.value = "";

  // Show random loading message
  addMessage(getRandomLoadingMessage(), "ai");

  // Get AI response
  const aiReply = await getAIResponse(message);

  // Remove the loading message
  const loadingMsg = chatWindow.querySelector(".msg.ai:last-child");
  if (loadingMsg && loadingMsg.textContent.includes("…")) {
    chatWindow.removeChild(loadingMsg);
  }

  // Show AI's reply
  addMessage(aiReply, "ai");
});
