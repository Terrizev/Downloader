const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API proxy endpoint
app.get('/api/download', async (req, res) => {
    const youtubeUrl = req.query.url;
    const quality = req.query.quality || 'high';
    
    try {
        const apiUrl = `https://zenz.biz.id/downloader/yt4?url=${encodeURIComponent(youtubeUrl)}&quality=${quality}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error('Failed to fetch from API');
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// All other routes serve the index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
