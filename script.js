
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

  const message = userInput.value.trim();

  if (!message) return;

  addMessage(message, "user");
  userInput.value = "";

  
setTimeout(function() {
  const question = message.toLowerCase();

  let reply;

  if (
    question.includes("who created you") ||
    question.includes("who is your creator") ||
    question.includes("who made you") ||
    question.includes("who developed you")
  ) {
    reply = "I was created by Oduyebo Abiola, the founder and developer of CYBERAI.";
  } else {
    reply = "I'm CYBERAI! Your message has been received. My AI connection is being configured.";
  }

  addMessage(reply, "bot");
}, 500);
  
