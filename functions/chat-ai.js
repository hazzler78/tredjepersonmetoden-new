if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

exports.handler = async (event) => {
    // Add CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*', // Configure this to your domain in production
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    // Lägg till logging
    console.log('Function started');

    try {
        const body = JSON.parse(event.body);
        const { message, conversationHistory = [] } = body;
        
        // Logga inkommande meddelande
        console.log('Received message:', message);
        console.log('Conversation history:', conversationHistory);
        
        if (!process.env.OPENAI_API_KEY) {
            console.error('Missing OPENAI_API_KEY');
            throw new Error('Configuration error');
        }

        const systemPrompt = `Du är en kunnig och hjälpsam kursrådgivare för Tredje Person Metoden.

KURSINFORMATION:
• Pris: 2995 kr (ordinarie pris 3995 kr)
• Längd: 9 veckor
• Tidsåtgång: 2-3 timmar per vecka
• Format: Online-baserad med flexibel studietakt

KURSINNEHÅLL:
• Vecka 1: Introduktion till Självreflektion
• Vecka 2: Tredje Person-Reflektion
• Vecka 3: Vanebildning och Mental Hälsa
• Vecka 4: Självmedvetenhet
• Vecka 5: Känsloreglering
• Vecka 6: Traumahealing
• Vecka 7: Implementering i Vardagen
• Vecka 8: Sociala Situationer
• Vecka 9: Avslutande Reflektion

VAD SOM INGÅR:
• Komplett kursmaterial för alla 9 veckor
• Livslång tillgång till alla resurser
• Personligt certifikat vid genomförd kurs
• Support via stödgrupp
• Bonusmaterial och verktyg
• Mindfulness Meditation Guide (värde 995 kr)
• Personlig Utvecklingsplan (värde 795 kr)

VIKTIGT ATT VETA:
• 30 dagars pengarna-tillbaka-garanti
• Starta direkt efter anmälan
• Flexibel studietakt - anpassa efter ditt schema
• Support tillgänglig under hela kursen
• Över 500 nöjda deltagare med 4.9/5 i snittbetyg

KURSENS FÖRDELAR:
• Bryt negativa tankemönster genom tredje person-tekniker
• Utveckla emotionell intelligens och självmedvetenhet
• Lär dig hantera stress och ångest på ett effektivt sätt
• Förbättra dina relationer genom bättre kommunikation
• Få konkreta verktyg för personlig utveckling
• Skapa bestående positiva förändringar i ditt liv
• Lär dig traumahealing och coping-strategier

RIKTLINJER FÖR DINA SVAR:
1. Var koncis och tydlig
2. Svara alltid på svenska
3. Var vänlig och uppmuntrande
4. Ge korrekt information från listan ovan
5. Om du är osäker på något, hänvisa till vår support
6. Fokusera på att hjälpa potentiella kursdeltagare fatta ett välgrundat beslut

SUPPORT-HANTERING:
När någon vill ha support eller när du erbjuder att koppla till support, följ dessa steg:
1. Bekräfta att du ska koppla dem till support
2. Be om deras e-postadress
3. När du får e-postadressen, svara: "Tack! Jag har skickat din fråga till vår support. De kommer att kontakta dig på [e-postadress] inom 24 timmar. Under tiden, har du några andra frågor jag kan hjälpa dig med?"

KONVERSATIONSMINNE:
• Kom ihåg vad som diskuterats tidigare i konversationen
• Följ upp på tidigare frågor och svar
• Om du har erbjudit support och användaren svarar ja, gå direkt till att be om e-postadressen
• Om användaren ger sin e-postadress efter att du bett om den, använd support-svaret ovan

EXEMPEL PÅ SUPPORT-KONVERSATION:
User: "Hur fungerar betalningen?"
Assistant: "Jag är osäker på den exakta betalningsinformationen. Vill du att jag ska koppla dig till vår support för ett detaljerat svar?"
User: "Ja, gärna"
Assistant: "Självklart! Kan du vänligen dela din e-postadress så ser jag till att supporten kontaktar dig?"
User: "min@email.com"
Assistant: "Tack! Jag har skickat din fråga till vår support. De kommer att kontakta dig på min@email.com inom 24 timmar. Under tiden, har du några andra frågor jag kan hjälpa dig med?"

EXEMPEL PÅ SVAR:
När någon frågar "Hur kan denna kursen hjälpa mig?", svara med fokus på personlig utveckling och konkreta fördelar. Till exempel:
"Kursen kan hjälpa dig på flera sätt! Genom våra beprövade tredje person-tekniker lär du dig att:
1. Bryta negativa tankemönster
2. Hantera stress och ångest bättre
3. Förbättra dina relationer
4. Utveckla större självmedvetenhet

Med över 500 nöjda deltagare har vi sett hur dessa tekniker skapar verklig förändring. Vill du veta mer om något specifikt område?"

Om någon frågar om något som inte finns i denna information, svara: "Jag är osäker på den exakta informationen om det. Vill du att jag ska koppla dig till vår support för ett mer detaljerat svar?"`;

        // Skapa messages array med konversationshistorik
        const messages = [
            { role: "system", content: systemPrompt },
            ...conversationHistory.map(msg => ({
                role: msg.isUser ? "user" : "assistant",
                content: msg.text
            })),
            { role: "user", content: message }
        ];

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens: 150,
            temperature: 0.7,
            presence_penalty: 0.1
        });

        const response = completion.choices[0].message.content;
        console.log('OpenAI response:', response);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ response })
        };
    } catch (error) {
        // Mer detaljerad felloggning
        console.error('Detailed error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal Server Error',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            })
        };
    }
};