/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent =
  "👋 Hello! How can I help you feel your most confident today?";
// Cloudflare Workers: Handle CORS and API key securely
const workerUrl = "https://aged-poetry-c41e.tmtucke2.workers.dev/";

// Memory to store conversation history
let conversationHistory = [
  {
    role: "system",
    content:
      "You are a beauty expert representing L’Oréal. Your sole purpose is to help users discover and choose the right L’Oréal products across all categories (haircare, skincare, makeup, etc.), as well as provide personalized routines and recommendations. Speak in an elegant, empowering, and inclusive tone. Be warm, knowledgeable, and supportive—like a trusted beauty advisor. Do not answer unrelated questions. Stay focused on helping the user find the ideal L’Oréal product based on their needs, preferences, and goals. Keep the responses concise and relevant.",
  },
];

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
  console.log("Sending request to Cloudflare Worker...");

  // Add user message to conversation history
  conversationHistory.push({ role: "user", content: userMessage });

  // The data we send to the Cloudflare Worker
  const data = {
    model: "gpt-4o", // Use the gpt-4o model
    messages: conversationHistory,
  };

  try {
    console.log("Request payload:", data);

    // Make the API request using fetch and async/await
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("Response status:", response.status);

    // Parse the response as JSON
    const result = await response.json();

    console.log("Response data:", result);

    // Get the AI's reply from the response
    const aiMessage = result.choices && result.choices[0].message.content;

    // Add AI response to conversation history
    conversationHistory.push({ role: "assistant", content: aiMessage });

    return aiMessage || "Sorry, I didn't understand that.";
  } catch (error) {
    console.error(
      "Error occurred while connecting to Cloudflare Worker:",
      error
    );
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

/* Function to dynamically update the question history */
function updateQuestionHistory(userMessage) {
  const historyList = document.getElementById("historyList");

  // Remove placeholder message if it exists
  const placeholder = historyList.querySelector("li");
  if (placeholder && placeholder.textContent === "No questions asked yet") {
    historyList.innerHTML = "";
  }

  // Add the new question to the history
  const newQuestion = document.createElement("li");
  newQuestion.textContent = userMessage;
  historyList.appendChild(newQuestion);
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  // Show user's message
  addMessage(message, "user");
  userInput.value = "";

  // Update question history
  updateQuestionHistory(message);

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

// Make the conversation history box clickable
const questionHistory = document.querySelector(".question-history");
const historyList = document.getElementById("historyList");

questionHistory.addEventListener("click", () => {
  questionHistory.classList.toggle("open");

  // If history is empty, show a placeholder message
  if (historyList.children.length === 0) {
    historyList.innerHTML = '<li>No questions asked yet</li>';
  }
});
