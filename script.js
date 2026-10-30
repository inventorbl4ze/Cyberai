


const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatBox = document.getElementById("chatBox");

const startCall = document.getElementById("startCall");
const endCall = document.getElementById("endCall");
const callStatus = document.getElementById("callStatus");

const BACKEND = "https://cyberai-voice-backend.onrender.com";

let peerConnection = null;
let microphoneStream = null;
let dataChannel = null;
let remoteAudio = null;

function addMessage(message, sender) {
  const div = document.createElement("div");
  div.className = "message " + sender;
  div.textContent = message;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

chatForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const originalMessage = userInput.value.trim();
  const message = originalMessage.toLowerCase();

  if (!message) return;

  addMessage(originalMessage, "user");
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

async function stopCall() {
  if (dataChannel) {
    dataChannel.close();
    dataChannel = null;
  }

  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  if (microphoneStream) {
    microphoneStream.getTracks().forEach(track => track.stop());
    microphoneStream = null;
  }

  if (remoteAudio) {
    remoteAudio.pause();
    remoteAudio.srcObject = null;
    remoteAudio = null;
  }

  startCall.disabled = false;
  endCall.disabled = true;
  callStatus.textContent = "Call ended";
}

startCall.addEventListener("click", async function() {
  startCall.disabled = true;
  callStatus.textContent = "Connecting...";

  try {
    const tokenResponse = await fetch(BACKEND + "/token", {
      method: "POST"
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.client_secret) {
      throw new Error(tokenData.error || "Could not get voice session.");
    }

    microphoneStream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });

    peerConnection = new RTCPeerConnection();

    remoteAudio = document.createElement("audio");
    remoteAudio.autoplay = true;
    document.body.appendChild(remoteAudio);

    peerConnection.ontrack = function(event) {
      remoteAudio.srcObject = event.streams[0];
      remoteAudio.play().catch(() => {
        callStatus.textContent = "Tap the page to allow audio playback.";
      });
    };

    microphoneStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, microphoneStream);
    });

    dataChannel = peerConnection.createDataChannel("oai-events");

    dataChannel.onopen = function() {
      callStatus.textContent = "Connected! You can speak now.";
      addMessage("CYBERAI voice call connected. You can speak now.", "bot");
    };

    dataChannel.onmessage = function(event) {
      const data = JSON.parse(event.data);

      if (data.type === "response.output_audio_transcript.done") {
        addMessage(data.transcript, "bot");
      }

      if (data.type === "error") {
        callStatus.textContent = "Voice error: " + data.error.message;
      }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    const sdpResponse = await fetch(
      "https://api.openai.com/v1/realtime/calls",
      {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: "Bearer " + tokenData.client_secret,
          "Content-Type": "application/sdp"
        }
      }
    );

    if (!sdpResponse.ok) {
      throw new Error("Could not connect to the voice service.");
    }

    const answer = {
      type: "answer",
      sdp: await sdpResponse.text()
    };

    await peerConnection.setRemoteDescription(answer);

    endCall.disabled = false;

  } catch (error) {
    console.error(error);
    callStatus.textContent = error.message;
    await stopCall();
  }
});

endCall.addEventListener("click", stopCall);
    
