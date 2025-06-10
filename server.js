// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration (same as your PHP)
const MODELS = {
  'flux': 'Flux',
  'turbo': 'Turbo',
  'midjourney': 'midjourney',
  'llama': 'llama',
  'openai': 'openai',
  'pollination': 'Pollination',
  'dreamweaver': 'Dreamweaver'
};

const RATIOS = {
  '1:1': { width: 1024, height: 1024 },
  '9:16': { width: 768, height: 1366 },
  '16:9': { width: 1920, height: 1080 },
  '4:3': { width: 1024, height: 768 },
  '3:4': { width: 768, height: 1024 },
  '2:3': { width: 800, height: 1200 },
  '3:2': { width: 1200, height: 800 }
};

// Image Generation Endpoint (same logic as PHP)
app.post('/generate', async (req, res) => {
  try {
    const { prompt, model, ratio, seed, steps, guidance, enhance, safe } = req.body;

    // Validation
    if (!prompt) {
      return res.status(400).json({ error: 'Neural prompt cannot be empty. Please provide a creative vision for the AI to manifest.' });
    }

    // Get model name
    const apiModel = MODELS[model.toLowerCase()] || 'Flux';
    const { width, height } = RATIOS[ratio] || RATIOS['1:1'];
    const encodedPrompt = encodeURIComponent(prompt);

    let apiUrl;
    if (model === 'pollination') {
      apiUrl = `https://botmaker.serv00.net/pollination.php?prompt=${encodedPrompt}`;
    } else if (model === 'dreamweaver') {
      apiUrl = `https://botfather.cloud/Apis/ImgGen/client.php?inputText=${encodedPrompt}`;
    } else {
      apiUrl = `https://image.hello-kaiiddo.workers.dev/${encodedPrompt}?` + new URLSearchParams({
        model: apiModel,
        width,
        height,
        steps: steps || 50,
        guidance: guidance || 7.5,
        enhance: enhance || 'true',
        safe: safe || 'true'
      });
    }

    // Fetch image
    const response = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
      timeout: 300000 // 5 minutes
    });

    // Check if image is valid
    const contentType = response.headers['content-type'];
    if (!contentType.startsWith('image/')) {
      throw new Error('AI failed to generate visual output. The neural network may be experiencing issues.');
    }

    // Convert to base64
    const base64Image = `data:${contentType};base64,${Buffer.from(response.data).toString('base64')}`;

    // Prepare response (same as PHP)
    const generationDetails = {
      'Neural Engine': MODELS[model] || 'Flux',
      'Prompt': prompt,
      'Aspect Ratio': ratio,
      'Resolution': `${width} × ${height} px`
    };

    if (!['pollination', 'dreamweaver'].includes(model)) {
      Object.assign(generationDetails, {
        'Seed': seed || 'Random',
        'Iterations': steps || 50,
        'Creativity Control': guidance || 7.5,
        'Quantum Enhance': enhance === 'true' ? 'Enabled' : 'Disabled',
        'Safety Protocol': safe === 'true' ? 'Enabled' : 'Disabled'
      });
    }

    res.json({
      imageUrl: base64Image,
      details: generationDetails
    });

  } catch (error) {
    console.error('Generation error:', error);
    let errorMessage = error.message;
    
    if (error.response) {
      errorMessage = `AI model returned status code: ${error.response.status}. Please try again with different parameters.`;
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Neural network connection timed out. Please try again.';
    }

    res.status(500).json({ error: errorMessage });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`PRINEXA AI Server running on port ${PORT}`);
});
