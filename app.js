const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API proxy endpoint
app.get('/api/download', async (req, res) => {
    const youtubeUrl = req.query.url;
    
    try {
        const apiUrl = `https://zenz.biz.id/downloader/yt4?url=${encodeURIComponent(youtubeUrl)}`;
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

// All routes serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
