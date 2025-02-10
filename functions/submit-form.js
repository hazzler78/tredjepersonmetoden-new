const { EMAILJS_USER_ID, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID } = process.env;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    
    // Skicka email via EmailJS
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_USER_ID,
        template_params: {
          to_email: 'info@tredjepersonmetoden.se',
          from_name: data.name,
          from_email: data.email,
          message: `Ny kursanmälan från ${data.name}`
        }
      })
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Anmälan mottagen' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
}; 