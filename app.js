const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Proxy Endpoint
app.get('/api/download', async (req, res) => {
    try {
        const youtubeUrl = req.query.url;
        
        if (!youtubeUrl) {
            return res.status(400).json({ error: 'YouTube URL is required' });
        }

        // Forward request to zenz.biz.id API
        const apiUrl = `https://zenz.biz.id/downloader/yt4?url=${encodeURIComponent(youtubeUrl)}`;
        const apiResponse = await fetch(apiUrl);
        
        if (!apiResponse.ok) {
            throw new Error('Failed to fetch from download API');
        }

        const data = await apiResponse.json();
        
        // Enhance response with additional metadata
        const enhancedData = {
            ...data,
            timestamp: new Date().toISOString(),
            apiVersion: 'DEATH-XMD-1.0'
        };

        res.json(enhancedData);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ 
            error: error.message,
            solution: 'Check the YouTube URL and try again'
        });
    }
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    ██████╗ ███████╗  █████╗ ████████╗██╗  ██╗██╗  ██╗███╗   ███╗██████╗ 
    ██╔══██╗██╔════╝ ██╔══██╗╚══██╔══╝██║  ██║╚██╗██╔╝████╗ ████║██╔══██╗
    ██║  ██║█████╗   ███████║   ██║   ███████║ ╚███╔╝ ██╔████╔██║██║  ██║
    ██║  ██║██╔══╝   ██╔══██║   ██║   ██╔══██║ ██╔██╗ ██║╚██╔╝██║██║  ██║
    ██████╔╝███████╗ ██║  ██║   ██║   ██║  ██║██╔╝ ██╗██║ ╚═╝ ██║██████╔╝
    ╚═════╝ ╚══════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚═════╝ 
    
    Server running on port ${PORT}
    Mode: ${process.env.NODE_ENV || 'development'}
    `);
});
