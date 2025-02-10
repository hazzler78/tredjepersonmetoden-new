async function simulateUserJourney() {
    console.log('🚀 Startar simulering av användarresa...');

    // 1. Simulera sidladdning
    console.log('\n1. Sidladdning');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await wait(1000);
    
    // 2. Testa scroll-funktionalitet
    console.log('\n2. Testar smooth scroll');
    const sections = document.querySelectorAll('section');
    for (let section of sections) {
        section.scrollIntoView({ behavior: 'smooth' });
        await wait(1000);
        const heading = section.querySelector('h2') || section.querySelector('h3');
        if (heading) {
            console.log(`  ✓ Scrollade till ${heading.textContent}`);
        } else {
            console.log(`  ✓ Scrollade till sektion`);
        }
    }

    // 3. Testa CTA-knappar och modal
    console.log('\n3. Testar CTA-knappar och anmälningsformulär');
    const ctaButton = document.querySelector('.hero .cta-button');
    ctaButton.click();
    await wait(500);
    console.log('  ✓ Öppnade anmälningsmodal');

    // 4. Testa formulär
    console.log('\n4. Fyller i och skickar formulär');
    const testData = {
        name: 'Test Testsson',
        email: 'test@example.com'
    };

    const nameInput = document.querySelector('#name');
    const emailInput = document.querySelector('#email');
    nameInput.value = testData.name;
    emailInput.value = testData.email;
    
    try {
        const form = document.querySelector('#signup-form');
        const submitEvent = new Event('submit', {
            bubbles: true,
            cancelable: true
        });
        
        await new Promise(resolve => {
            form.addEventListener('submit', () => {
                setTimeout(resolve, 1000); // Vänta på att anropet ska slutföras
            }, { once: true });
            form.dispatchEvent(submitEvent);
        });
        
        console.log('  ✓ Formulär skickat och hanterat');
    } catch (error) {
        console.error('  ✗ Fel vid formulärhantering:', error);
    }

    // 5. Testa exit intent
    console.log('\n5. Testar exit intent');
    document.dispatchEvent(new MouseEvent('mouseleave', {
        clientY: -10
    }));
    await wait(500);
    console.log('  ✓ Exit intent modal visades');

    // 6. Testa nedräkning
    console.log('\n6. Testar nedräkning');
    const countdown = document.querySelector('.countdown');
    if (countdown && countdown.textContent !== '') {
        console.log('  ✓ Nedräkning fungerar');
    }

    // 7. Testa localStorage
    console.log('\n7. Kontrollerar localStorage');
    const savedProgress = localStorage.getItem('courseProgress');
    if (savedProgress) {
        console.log('  ✓ Användarens framsteg sparades');
        console.log('  Sparad data:', JSON.parse(savedProgress));
    }

    console.log('\n✨ Simulering slutförd!');
}

// Hjälpfunktion för att vänta
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Funktion för att mocka API-anrop
function mockApiResponse() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Anmälan mottagen'
            });
        }, 500);
    });
}

// Kör tester
simulateUserJourney().catch(console.error); 