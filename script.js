const API_KEY = 'AIzaSyAhf1wm4e_UfJc0XRGq7xXMlQ_RbdgXKsI';
let VIDEO_ID = '';
let TARGET_LIKES = 100; // Número de likes desejado por padrão

function extractVideoID(url) {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('v');
}

async function fetchLikes() {
    try {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${VIDEO_ID}&key=${API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const likes = data.items[0].statistics.likeCount;
        return parseInt(likes, 10);
    } catch (error) {
        console.error('Erro ao buscar dados de likes:', error);
        return 0;
    }
}

function calculateTargetLikes(currentLikes) {
    // Calcula a próxima centena superior
    return Math.ceil(currentLikes / 100) * 100;
}

function updateProgressBar(likes) {
    const progressBarFill = document.getElementById('like-progress-fill');
    const likeCount = document.getElementById('like-count');
    const likeGoal = document.getElementById('like-goal');
    const percentage = (likes / TARGET_LIKES) * 100;

    progressBarFill.style.width = `${Math.min(percentage, 100)}%`;
    likeCount.textContent = likes;
    likeGoal.textContent = TARGET_LIKES;

    if (likes >= TARGET_LIKES) {
        // Atualiza a meta para a próxima centena
        TARGET_LIKES = calculateTargetLikes(likes);
        // Atualiza o valor da meta na UI
        likeGoal.textContent = TARGET_LIKES;
        // Redefine a barra de progresso
        progressBarFill.style.width = '0%';
    }
}

async function updateLikes() {
    if (VIDEO_ID) {
        const likes = await fetchLikes();
        updateProgressBar(likes);
    }
}

function submitLink() {
    const liveLink = document.getElementById('live-link').value;
    
    if (liveLink) {
        VIDEO_ID = extractVideoID(liveLink);
    }
    
    fetchLikes().then(likes => {
        TARGET_LIKES = calculateTargetLikes(likes);
        updateProgressBar(likes);
    });

    // Atualiza a URL com os parâmetros
    const newUrl = `${window.location.pathname}?video=${VIDEO_ID}&likes=${TARGET_LIKES}`;
    window.history.pushState({}, '', newUrl);
    
    updateLikes(); // Chamada inicial para configurar o contador
}

// Carregar os parâmetros da URL quando a página for carregada
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    VIDEO_ID = params.get('video') || '';
    TARGET_LIKES = parseInt(params.get('likes'), 10) || 100;
    
    if (VIDEO_ID) {
        document.getElementById('live-link').value = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
        fetchLikes().then(likes => {
            if (!params.has('likes')) {
                TARGET_LIKES = calculateTargetLikes(likes);
            }
            updateProgressBar(likes);
        });
    } else {
        updateLikes();
    }
});

// Atualiza os likes a cada 5 segundos
setInterval(updateLikes, 5000);