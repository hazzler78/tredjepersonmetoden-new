document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    });

    // Observe all sections
    document.querySelectorAll('section').forEach((section) => {
        observer.observe(section);
    });

    // Modal functionality
    const modal = document.getElementById('signup-modal');
    const ctaButtons = document.querySelectorAll('.cta-button');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.style.display = 'block';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Countdown timer för specialerbjudande
    function startCountdown(duration, display) {
        let timer = duration, hours, minutes, seconds;
        
        let countdown = setInterval(function () {
            hours = parseInt(timer / 3600, 10);
            minutes = parseInt((timer % 3600) / 60, 10);
            seconds = parseInt(timer % 60, 10);

            display.textContent = hours + "h " + minutes + "m " + seconds + "s";

            if (--timer < 0) {
                clearInterval(countdown);
                display.textContent = "Erbjudandet har gått ut!";
            }
        }, 1000);
    }

    // Progress bar för anmälningsformulär
    let currentStep = 1;
    const totalSteps = 3;
    
    function updateProgress() {
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            const progress = (currentStep / totalSteps) * 100;
            progressBar.style.width = progress + '%';
        }
    }

    // Spara användarens progress i localStorage
    function saveProgress(email) {
        const progress = {
            email: email,
            lastStep: currentStep,
            timestamp: new Date().getTime()
        };
        localStorage.setItem('courseProgress', JSON.stringify(progress));
    }

    // Automatisk scroll animation till nästa sektion
    function scrollToNextSection(currentSection) {
        const sections = document.querySelectorAll('section');
        const currentIndex = Array.from(sections).indexOf(currentSection);
        const nextSection = sections[currentIndex + 1];
        
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // FAQ accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            const wasActive = item.classList.contains('active');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(otherItem => {
                otherItem.classList.remove('active');
            });

            // Toggle clicked item
            if (!wasActive) {
                item.classList.add('active');
            }
        });
    });

    // Popup för att fånga leads som försöker lämna sidan
    let hasShownExitIntent = false;
    
    document.addEventListener('mouseleave', (e) => {
        if (e.clientY < 0 && !hasShownExitIntent) {
            showExitIntentModal();
            hasShownExitIntent = true;
        }
    });

    // Initiera funktioner
    const countdownDisplay = document.querySelector('.countdown');
    if (countdownDisplay) {
        startCountdown(24 * 60 * 60, countdownDisplay); // 24 timmar
    }

    updateProgress();

    // Chatbot functionality
    const chatResponses = {
        'hej': 'Hej! Hur kan jag hjälpa dig idag?',
        'pris': 'Kursen kostar 2995 kr och inkluderar allt kursmaterial plus bonusar.',
        'tid': 'Kursen tar cirka 2-3 timmar per vecka i 9 veckor.',
        'start': 'Du kan börja kursen direkt efter anmälan!',
        'garanti': 'Vi erbjuder 30 dagars pengarna-tillbaka-garanti.',
        'default': 'Tack för din fråga! Vill du veta mer om kursens upplägg, pris eller garantier?'
    };

    async function getBotResponse(message) {
        try {
            console.log('Sending message:', message);
            const response = await fetch('/.netlify/functions/chat-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Detailed error:', error);
            return `Ett fel uppstod: ${error.message}. Försök igen om en stund.`;
        }
    }

    function initializeChat() {
        const chatToggle = document.querySelector('.chat-toggle');
        const chatContainer = document.querySelector('.chat-container');
        
        if (!chatToggle || !chatContainer) {
            console.error('Chat elements not found');
            return;
        }

        const closeChat = document.querySelector('.close-chat');
        const sendButton = document.querySelector('.send-message');
        const chatInput = document.querySelector('.chat-input input');
        const chatMessages = document.querySelector('.chat-messages');

        if (!closeChat || !sendButton || !chatInput || !chatMessages) {
            console.error('Required chat elements missing');
            return;
        }

        let isTyping = false;

        function addMessage(message, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
            messageDiv.textContent = message;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function addTypingIndicator() {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'message bot typing';
            typingDiv.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return typingDiv;
        }

        async function handleMessage() {
            if (isTyping) return;

            const message = chatInput.value.trim();
            if (!message) return;

            addMessage(message, true);
            chatInput.value = '';
            isTyping = true;

            const typingIndicator = addTypingIndicator();
            
            try {
                const response = await getBotResponse(message);
                typingIndicator.remove();
                addMessage(response);
            } catch (error) {
                typingIndicator.remove();
                addMessage('Ursäkta, jag hade lite tekniska problem. Kan du omformulera din fråga?');
            }
            
            isTyping = false;
        }

        chatToggle.addEventListener('click', () => {
            chatContainer.classList.toggle('hidden');
        });

        closeChat.addEventListener('click', () => {
            chatContainer.classList.add('hidden');
        });

        sendButton.addEventListener('click', handleMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleMessage();
            }
        });
    }

    // Initiera chatbot när sidan laddats
    initializeChat();
});

// Hjälpfunktioner för UI feedback
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.querySelector('.modal-content').appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.modal-content').appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showExitIntentModal() {
    const modal = document.getElementById('exit-intent-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

async function submitForm(data) {
    try {
        const response = await fetch('/.netlify/functions/submit-form', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Improve modal close functionality
document.querySelectorAll('.close-button').forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        modal.style.display = 'none';
    });
});

// Add escape key listener for modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
});

async function handlePaymentAndRegistration(data) {
    try {
        // 1. Skapa en Stripe session
        const response = await fetch('https://api.tredjepersonmetoden.se/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: data.email,
                name: data.name,
                course: 'third-person-method',
                price: 2995
            })
        });

        const session = await response.json();

        // 2. Omdirigera till Stripe's checkout
        const stripe = Stripe('YOUR_PUBLISHABLE_KEY');
        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        });

        if (result.error) {
            throw new Error(result.error.message);
        }

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Uppdatera form-hanteringen
document.querySelector("#signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    try {
        const form = e.target;
        const formData = new FormData(form);
        
        const response = await fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString()
        });
        
        if (response.ok) {
            showSuccess("Din anmälan är mottagen! Vi kontaktar dig inom kort.");
            form.reset();
            // Stäng modalen efter framgångsrik anmälan
            setTimeout(() => {
                document.getElementById('signup-modal').style.display = 'none';
            }, 2000);
        } else {
            throw new Error("Det gick inte att skicka formuläret");
        }
    } catch (error) {
        showError("Ett fel uppstod. Försök igen senare.");
        console.error("Form submission error:", error);
    }
}); 