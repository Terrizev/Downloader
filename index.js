document.addEventListener('DOMContentLoaded', function() {
    const fetchBtn = document.getElementById('fetch-btn');
    const youtubeUrlInput = document.getElementById('youtube-url');
    const resultContainer = document.getElementById('result-container');
    const thumbnail = document.getElementById('thumbnail');
    const videoTitle = document.getElementById('video-title');
    const downloadBtn = document.getElementById('download-btn');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');

    fetchBtn.addEventListener('click', fetchVideoData);
    youtubeUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') fetchVideoData();
    });

    function fetchVideoData() {
        const url = youtubeUrlInput.value.trim();
        
        if (!url) {
            showError('Please enter a YouTube URL');
            return;
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            showError('Invalid YouTube URL');
            return;
        }

        loading.style.display = 'block';
        resultContainer.style.display = 'none';
        errorMessage.style.display = 'none';

        const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

        fetch(oEmbedUrl)
            .then(response => {
                if (!response.ok) throw new Error('Video not found');
                return response.json();
            })
            .then(data => {
                thumbnail.src = data.thumbnail_url;
                videoTitle.textContent = data.title;
                downloadBtn.href = `https://zenz.biz.id/downloader/yt4?url=${encodeURIComponent(url)}`;
                resultContainer.style.display = 'block';
                loading.style.display = 'none';
            })
            .catch(error => {
                showError(error.message || 'Failed to fetch video data');
                loading.style.display = 'none';
            });
    }

    function extractVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        resultContainer.style.display = 'none';
        loading.style.display = 'none';
    }
});
