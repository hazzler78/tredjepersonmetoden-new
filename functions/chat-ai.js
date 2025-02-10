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

    try {
        const body = JSON.parse(event.body);
        
        // Input validation
        if (!body.message || typeof body.message !== 'string') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid message format' })
            };
        }

        const systemPrompt = `Du \u00E4r en hj\u00E4lpsam kursr\u00E5dgivare f\u00F6r Tredje Person Metoden.

Detta \u00E4r fakta om kursen:
\u2022 Pris: 2995 kr (ordinarie pris 3995 kr)
\u2022 L\u00E4ngd: 9 veckor
\u2022 Inneh\u00E5ller: Kursmaterial, bonusar, livsl\u00E5ng tillg\u00E5ng
\u2022 Garanti: 30 dagars pengarna-tillbaka-garanti

Svara koncist och v\u00E4nligt p\u00E5 svenska. Fokusera p\u00E5 att hj\u00E4lpa potentiella kursdeltagare.`;

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

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                response: completion.choices[0].message.content
            }),
        };
    } catch (error) {
        console.error('Error:', error);
        
        // More specific error handling
        if (error instanceof SyntaxError) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid JSON in request body' })
            };
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal Server Error',
                message: process.env.NODE_ENV === 'development' ? error.message : undefined
            }),
        };
    }
};