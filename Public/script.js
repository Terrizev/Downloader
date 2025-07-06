document.addEventListener('DOMContentLoaded', function() {
    const fetchBtn = document.getElementById('fetch-btn');
    const youtubeUrlInput = document.getElementById('youtube-url');
    const resultContainer = document.getElementById('result-container');
    const thumbnail = document.getElementById('thumbnail');
    const videoTitle = document.getElementById('video-title');
    const downloadBtn = document.getElementById('download-btn');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const qualitySelect = document.getElementById('quality');

    fetchBtn.addEventListener('click', fetchVideoData);
    youtubeUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            fetchVideoData();
        }
    });

    qualitySelect.addEventListener('change', updateDownloadLink);

    function fetchVideoData() {
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

        loading.style.display = 'block';
        resultContainer.style.display = 'none';
        errorMessage.style.display = 'none';

        const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

        fetch(oEmbedUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Video not found or private');
                }
                return response.json();
            })
            .then(data => {
                thumbnail.src = data.thumbnail_url;
                videoTitle.textContent = data.title;
                updateDownloadLink();
                resultContainer.style.display = 'block';
                loading.style.display = 'none';
            })
            .catch(error => {
                showError(error.message || 'Failed to fetch video data');
                loading.style.display = 'none';
            });
    }

    function updateDownloadLink() {
        const url = youtubeUrlInput.value.trim();
        const videoId = extractVideoId(url);
        const quality = qualitySelect.value;
        
        if (videoId) {
            downloadBtn.href = `https://zenz.biz.id/downloader/yt4?url=${encodeURIComponent(url)}&quality=${quality}`;
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

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        resultContainer.style.display = 'none';
        loading.style.display = 'none';
    }
});
