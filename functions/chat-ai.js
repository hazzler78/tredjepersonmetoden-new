if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { message } = JSON.parse(event.body);
        
        const systemPrompt = `Du är en hjälpsam kursrådgivare för Tredje Person Metoden. 
        Detta är fakta om kursen:
        - Pris: 2995 kr (ordinarie pris 3995 kr)
        - Längd: 9 veckor
        - Innehåller: Kursmaterial, bonusar, livslång tillgång
        - Garanti: 30 dagars pengarna-tillbaka-garanti
        
        Svara koncist och vänligt på svenska.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            max_tokens: 150,
            temperature: 0.7,
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                response: completion.choices[0].message.content
            }),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
}; 