const router = require('express').Router();

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body || {};
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Invalid messages array provided' });
    }

    const apiKey = process.env.SAMBANOVA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'SambaNova API Key is not configured on the server' });
    }

    const systemPrompt = {
      role: 'system',
      content: 'You are the LinkPulse AI Guide, a friendly and helpful assistant designed to support users of the LinkPulse URL Shortener & Analytics platform. LinkPulse allows users to shorten URLs, create custom aliases, secure links with passwords, set expiry dates, redirect expired links, download QR codes, perform bulk CSV uploads, view real-time visitor analytics, and track clicks. Respond concisely and professionally. Use markdown formatting to make your answers structured and easy to read. If a user asks about features, explain how they work (like entering a password to lock a link, using the auto-polling dashboard, or searching/filtering links).'
    };

    // Prepend system prompt to the messages list
    const apiMessages = [systemPrompt, ...messages];

    const response = await fetch('https://api.sambanova.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'Meta-Llama-3.3-70B-Instruct',
        messages: apiMessages,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SambaNova API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
    
    res.json({ reply: assistantMessage });
  } catch (err) {
    console.error('Chat endpoint error:', err.message);
    res.status(500).json({ error: 'Failed to communicate with SambaNova AI' });
  }
});

module.exports = router;
