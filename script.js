const API_KEY = 'AIzaSyCqv78k5T-i4z2pJB7wq17VQktCh3wAx20';
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
    let percentage = (likes / TARGET_LIKES) * 100;

    // Se atingir ou ultrapassar a meta
    if (likes >= TARGET_LIKES) {
        TARGET_LIKES = calculateTargetLikes(likes); // Calcula a nova meta
        percentage = 0; // Reseta a barra de progresso para 0%
    }

    progressBarFill.style.width = `${Math.min(percentage, 100)}%`;
    likeCount.textContent = likes;
    likeGoal.textContent = TARGET_LIKES;
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

// Atualiza os likes a cada 1 segundos
setInterval(updateLikes, 1000);
