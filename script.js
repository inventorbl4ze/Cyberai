

const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatBox = document.getElementById("chatBox");

function addMessage(message, sender) {
  const div = document.createElement("div");
  div.className = "message " + sender;
  div.textContent = message;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

chatForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const message = userInput.value.trim().toLowerCase();

  if (!message) return;

  addMessage(userInput.value.trim(), "user");
  userInput.value = "";

  let reply;

  if (
    message.includes("who created you") ||
    message.includes("who is your creator") ||
    message.includes("who made you") ||
    message.includes("who developed you") ||
    message.includes("your creator")
  ) {
    reply = "I was created by Oduyebo Abiola, the founder and developer of CYBERAI.";
  } else {
    reply = "Hello! I am CYBERAI. My AI connection is being configured.";
  }

  setTimeout(function() {
    addMessage(reply, "bot");
  }, 500);
});
