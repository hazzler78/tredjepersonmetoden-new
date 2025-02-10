// Initiera chatApp först, före alla andra scripts
window.chatApp = {
    conversationHistory: [],
    isLocalTesting: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    pendingSupport: {
        active: false,
        question: '',
        email: ''
    }
};

// Mock responses för lokal testning
const mockResponses = {
    "support-request": {
        trigger: message => message.includes("test@example.com"),
        response: "Tack! Jag har skickat din fråga till vår support. De kommer att kontakta dig på test@example.com inom 24 timmar. Under tiden, har du några andra frågor jag kan hjälpa dig med?"
    },
    "kurs-tid": {
        trigger: message => message.toLowerCase().includes("måste man göra allt på en gång"),
        response: "Nej, kursen är helt flexibel! Du kan anpassa studietakten efter ditt eget schema. Du har livslång tillgång till materialet och kan ta den tid du behöver."
    },
    "rabatt": {
        trigger: message => message.toLowerCase().includes("rabatt"),
        response: "Just nu erbjuder vi kursen för 2995 kr istället för ordinarie pris 3995 kr. Detta är vårt bästa erbjudande och inkluderar alla bonusar!"
    },
    "teknisk-support": {
        trigger: message => message.toLowerCase().includes("problem") && message.toLowerCase().includes("logga in"),
        response: "Jag förstår att du har tekniska problem. Låt mig hjälpa dig genom att koppla dig till vår support. Kan du dela din e-postadress?"
    },
    "traumahealing": {
        trigger: message => message.toLowerCase().includes("traumahealing"),
        response: "I vecka 6 fokuserar vi specifikt på traumahealing. Du får lära dig effektiva coping-strategier och trygghetsskapande övningar. Detta är en av våra mest uppskattade delar av kursen!"
    }
};

// Definiera getBotResponse direkt
window.chatApp.getBotResponse = async function(message) {
    try {
        console.log('Sending message:', message);

        // Kolla om vi väntar på en e-postadress för support
        if (window.chatApp.pendingSupport.active) {
            // Enkel e-postvalidering
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(message)) {
                window.chatApp.pendingSupport.email = message;
                
                // Här kan du lägga till kod för att skicka supportärendet till ditt system
                console.log('Support request:', {
                    question: window.chatApp.pendingSupport.question,
                    email: window.chatApp.pendingSupport.email
                });

                // Återställ pending support
                window.chatApp.pendingSupport.active = false;
                window.chatApp.pendingSupport.question = '';
                
                return `Tack! Jag har skickat din fråga till vår support. De kommer att kontakta dig på ${message} inom 24 timmar. Under tiden, har du några andra frågor jag kan hjälpa dig med?`;
            } else {
                return "Det där ser inte ut som en giltig e-postadress. Kan du försöka igen?";
            }
        }

        // Om vi kör lokalt, använd mock responses
        if (window.chatApp.isLocalTesting) {
            console.log('Using mock responses for local testing');
            
            // Hitta matchande mock response
            for (const [key, mock] of Object.entries(mockResponses)) {
                if (mock.trigger(message)) {
                    return mock.response;
                }
            }

            // Default mock response om ingen match hittas
            return "Jag förstår din fråga om " + message + ". Vill du veta mer om något specifikt område av kursen?";
        }

        // Om inte lokal testning, använd riktiga API:et
        const response = await fetch('/.netlify/functions/chat-ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message,
                conversationHistory: window.chatApp.conversationHistory,
                pendingSupport: window.chatApp.pendingSupport
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Om AI:n ber om e-postadress, spara den aktuella frågan
        if (data.response.toLowerCase().includes("kan du vänligen dela din e-postadress")) {
            window.chatApp.pendingSupport.active = true;
            window.chatApp.pendingSupport.question = message;
        }
        
        return data.response;
    } catch (error) {
        console.error('Detailed error:', error);
        if (window.chatApp.isLocalTesting) {
            return "Detta är ett test-svar eftersom vi kör lokalt. I produktionen skulle detta vara ett riktigt svar från AI:n.";
        }
        return `Ett fel uppstod: ${error.message}. Försök igen om en stund.`;
    }
};

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

    // Förbättrad hantering av exit intent popup
    let hasShownExitIntent = false;
    let hasSubmittedForm = false;

    // Kontrollera om användaren redan har sett erbjudandet
    const exitIntentShown = localStorage.getItem('exitIntentShown');
    const lastShownTimestamp = localStorage.getItem('exitIntentLastShown');
    const minimumTimeBetweenShows = 7 * 24 * 60 * 60 * 1000; // 7 dagar

    document.addEventListener('mouseleave', (e) => {
        const now = new Date().getTime();
        const timeOnPage = now - performance.timing.navigationStart;
        const hasBeenOnPageLongEnough = timeOnPage > 30000; // 30 sekunder
        
        // Kontrollera alla villkor innan vi visar popup
        if (e.clientY < 0 && // Musen lämnar fönstret uppåt
            !hasShownExitIntent && // Inte visad denna session
            !hasSubmittedForm && // Användaren har inte redan anmält sig
            hasBeenOnPageLongEnough && // Har varit på sidan tillräckligt länge
            (!exitIntentShown || // Aldrig sett tidigare
             (lastShownTimestamp && (now - parseInt(lastShownTimestamp)) > minimumTimeBetweenShows)) // Eller tillräckligt länge sedan sist
        ) {
            showExitIntentModal();
            hasShownExitIntent = true;
            localStorage.setItem('exitIntentShown', 'true');
            localStorage.setItem('exitIntentLastShown', now.toString());
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

            // Spara meddelandet i konversationshistoriken
            window.chatApp.conversationHistory.push({
                text: message,
                isUser: isUser
            });
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
                const response = await window.chatApp.getBotResponse(message);
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

// Uppdatera form submission för att markera när användaren har anmält sig
document.querySelector("#signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.classList.add('loading');
    
    try {
        const form = e.target;
        const formData = new FormData(form);
        
        const response = await fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString()
        });
        
        if (response.ok) {
            hasSubmittedForm = true; // Markera att användaren har anmält sig
            localStorage.setItem('hasSubmittedForm', 'true'); // Spara i localStorage
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
    } finally {
        submitButton.classList.remove('loading');
    }
}); 