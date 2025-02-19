// js/chatbot.js

document.getElementById('send-btn').addEventListener('click', function() {
    const userInput = document.getElementById('user-input');
    const messageText = userInput.value.trim();
    
    if (messageText) {
        addMessage('user', messageText);
        userInput.value = '';
        getBotResponse(messageText);
    }
});

function addMessage(sender, text) {
    const messagesContainer = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;

    // Create a timestamp
    const timestamp = document.createElement('span');
    timestamp.className = 'timestamp';
    timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.appendChild(timestamp);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to the bottom
}

async function getBotResponse(userMessage) {
    try {
        // Call your own backend endpoint
        const response = await fetch('/api/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
        });

        if (response.ok) {
            const data = await response.json();
            const botMessage = data.message;
            addMessage('bot', botMessage);
        } else {
            console.error("Error fetching response:", response.statusText);
            addMessage('bot', "Sorry, I couldn't get a response from the server.");
        }
    } catch (error) {
        console.error("Fetch error:", error);
        addMessage('bot', "Sorry, there was an error connecting to the server.");
    }
}
