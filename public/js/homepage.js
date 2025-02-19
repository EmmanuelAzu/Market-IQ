const text = `Hello there, future investor! 👋
Welcome to MarketIQ, where finance meets innovation.

I'm Emmanuel Azubuike – a passionate Computer Science student with a love for both finance and programming.
Here at MarketIQ, we blend cutting-edge AI with market insights to create an engaging, intuitive experience.

Explore our interactive chatbot, dive into the stock viewer, and let's revolutionize how we see finance together! 🚀`;

const element = document.getElementById('animated-intro');
let index = 0;
const speed = 90; // typing speed in milliseconds

function typeWriter() {
  if (index < text.length) {
    element.innerHTML += text.charAt(index);
    index++;
    setTimeout(typeWriter, speed);
  }
}

// Start the typewriter animation
typeWriter();
