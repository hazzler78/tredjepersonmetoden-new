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
        
        // Logga inkommande meddelande
        console.log('Received message:', body.message);
        
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

EXEMPEL PÅ SVAR:
När någon frågar "Hur kan denna kursen hjälpa mig?", svara med fokus på personlig utveckling och konkreta fördelar. Till exempel:
"Kursen kan hjälpa dig på flera sätt! Genom våra beprövade tredje person-tekniker lär du dig att:
1. Bryta negativa tankemönster
2. Hantera stress och ångest bättre
3. Förbättra dina relationer
4. Utveckla större självmedvetenhet

Med över 500 nöjda deltagare har vi sett hur dessa tekniker skapar verklig förändring. Vill du veta mer om något specifikt område?"

Om någon frågar om något som inte finns i denna information, svara: "Jag är osäker på den exakta informationen om det. Vill du att jag ska koppla dig till vår support för ett mer detaljerat svar?"`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: body.message }
            ],
            max_tokens: 150,
            temperature: 0.7,
            presence_penalty: 0.1,  // Adds slight preference for unique responses
        });

        // Logga svaret
        console.log('OpenAI response:', completion.choices[0].message.content);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                response: completion.choices[0].message.content
            }),
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
            }),
        };
    }
};