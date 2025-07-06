document.addEventListener('DOMContentLoaded', function() {
    const fetchBtn = document.getElementById('fetch-btn');
    const youtubeUrlInput = document.getElementById('youtube-url');
    const resultContainer = document.getElementById('result-container');
    const thumbnail = document.getElementById('thumbnail');
    const videoTitle = document.getElementById('video-title');
    const videoDetails = document.getElementById('video-details');
    const downloadBtn = document.getElementById('download-btn');
    const downloadStatus = document.getElementById('download-status');
    const loading = document.getElementById('loading');
    const loadingText = document.getElementById('loading-text');
    const errorMessage = document.getElementById('error-message');

    fetchBtn.addEventListener('click', fetchVideoData);
    youtubeUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') fetchVideoData();
    });

    downloadBtn.addEventListener('click', downloadVideo);

    async function fetchVideoData() {
        const url = youtubeUrlInput.value.trim();
        
        if (!url) {
            showError('Please enter a YouTube URL');
            return;
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            showError('Invalid YouTube URL. Please check and try again.');
            return;
        }

        showLoading('Fetching video data...');
        hideResults();
        hideError();

        try {
            // First get basic info via oEmbed
            const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
            const oEmbedResponse = await fetch(oEmbedUrl);
            
            if (!oEmbedResponse.ok) {
                throw new Error('Video not found or private');
            }
            
            const oEmbedData = await oEmbedResponse.json();
            
            // Then get download info from your API
            loadingText.textContent = 'Fetching download options...';
            const apiUrl = `https://zenz.biz.id/downloader/yt4?url=${encodeURIComponent(url)}`;
            const apiResponse = await fetch(apiUrl);
            
            if (!apiResponse.ok) {
                throw new Error('Failed to get download information');
            }
            
            const apiData = await apiResponse.json();
            
            // Display the results
            thumbnail.src = oEmbedData.thumbnail_url;
            videoTitle.textContent = oEmbedData.title;
            
            // Display additional details from API if available
            let detailsHTML = '';
            if (apiData) {
                detailsHTML += `<p><strong>Status:</strong> ${apiData.status || 'Available'}</p>`;
                if (apiData.result) {
                    detailsHTML += `<p><strong>Quality:</strong> ${apiData.result.quality || 'High'}</p>`;
                    detailsHTML += `<p><strong>Size:</strong> ${apiData.result.filesize || 'N/A'}</p>`;
                }
            }
            videoDetails.innerHTML = detailsHTML;
            
            showResults();
        } catch (error) {
            showError(error.message || 'Failed to fetch video data');
        } finally {
            hideLoading();
        }
    }

    async function downloadVideo() {
        const url = youtubeUrlInput.value.trim();
        if (!url) return;

        downloadBtn.disabled = true;
        downloadStatus.textContent = 'Preparing download...';
        downloadStatus.style.color = 'var(--accent-green)';

        try {
            const apiUrl = `https://zenz.biz.id/downloader/yt4?url=${encodeURIComponent(url)}`;
            downloadStatus.textContent = 'Downloading... (this may take a moment)';
            
            // For direct download
            window.location.href = apiUrl;
            
            downloadStatus.textContent = 'Download started!';
        } catch (error) {
            downloadStatus.textContent = 'Download failed: ' + error.message;
            downloadStatus.style.color = 'var(--accent-red)';
        } finally {
            downloadBtn.disabled = false;
            setTimeout(() => {
                downloadStatus.textContent = '';
            }, 5000);
        }
    }

    function extractVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        
        if (match && match[2].length === 11) {
            return match[2];
        }
        
        const shortsRegExp = /^.*(youtube.com\/shorts\/)([^#\&\?]*).*/;
        const shortsMatch = url.match(shortsRegExp);
        
        if (shortsMatch && shortsMatch[2].length === 11) {
            return shortsMatch[2];
        }
        
        return null;
    }

    function showLoading(text) {
        loadingText.textContent = text;
        loading.style.display = 'block';
    }

    function hideLoading() {
        loading.style.display = 'none';
    }

    function showResults() {
        resultContainer.style.display = 'block';
    }

    function hideResults() {
        resultContainer.style.display = 'none';
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function hideError() {
        errorMessage.style.display = 'none';
    }
});
