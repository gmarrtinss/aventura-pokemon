import { pokeData, galleryData } from './js/data.js';

const STATE = {
    isPaused: false,
    typingTimer: null,
    currentPhoto: 0
};

const sounds = {
    music: document.getElementById('bg-music'),
    open: document.getElementById('sound-open'),
    click: document.getElementById('sound-click')
};

function playSound(id) {
    if (sounds[id]) {
        sounds[id].currentTime = 0;
        sounds[id].play().catch(e => console.log("Áudio bloqueado", e));
    }
}

// IA e Direção (Mantenha igual ao anterior)
function atualizarDirecao(el, deltaX, deltaY) {
    const sprite = el.querySelector('.pixel-sprite');
    sprite.classList.remove('facing-front', 'facing-back', 'facing-side', 'flip');
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        sprite.classList.add('facing-side');
        if (deltaX > 0) sprite.classList.add('flip');
    } else {
        deltaY > 0 ? sprite.classList.add('facing-front') : sprite.classList.add('facing-back');
    }
}

function iniciarIA(id, chance) {
    const el = document.getElementById(id);
    const sprite = el.querySelector('.pixel-sprite');
    setInterval(() => {
        if (STATE.isPaused) return;
        if (Math.random() < chance) {
            const curX = parseFloat(el.style.left) || 0;
            const curY = parseFloat(el.style.top) || 0;
            let nX = curX, nY = curY;
            if (Math.random() > 0.5) nX = Math.floor(Math.random() * 60) + 20;
            else nY = Math.floor(Math.random() * 50) + 20;
            const dist = Math.abs((nX - curX) || (nY - curY));
            if (dist > 0) {
                const tempo = dist / 18;
                atualizarDirecao(el, nX - curX, nY - curY);
                el.style.transition = `all ${tempo}s linear`;
                sprite.classList.add('walking');
                el.style.left = `${nX}%`; el.style.top = `${nY}%`;
                setTimeout(() => sprite.classList.remove('walking'), tempo * 1000);
            }
        }
    }, 3500);
}

// Abertura
window.abrirPokebola = function() {
    playSound('open');
    if (sounds.music) { sounds.music.volume = 0.3; sounds.music.play(); }
    const sprite = document.getElementById('pokebola-sprite');
    sprite.classList.remove('animate-float');
    setTimeout(() => sprite.className = 'facing-intermediate', 300);
    setTimeout(() => {
        sprite.className = 'facing-open-light';
        document.getElementById('flash-effect').style.opacity = '1';
    }, 800);
    setTimeout(() => {
        document.getElementById('flash-effect').style.opacity = '0';
        document.getElementById('intro-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('intro-screen').classList.add('hidden');
            document.getElementById('main-game').classList.remove('hidden');
            iniciarIA('gengar-container', 0.6); iniciarIA('snorlax-container', 0.2);
        }, 1000);
    }, 1800);
};

// Galeria de Memórias
function atualizarFoto() {
    const photo = galleryData[STATE.currentPhoto];
    document.getElementById('gallery-photo').src = photo.url;
    document.getElementById('gallery-caption').innerText = photo.legenda;
}

window.navegarGaleria = function(dir) {
    playSound('click');
    STATE.currentPhoto = (STATE.currentPhoto + dir + galleryData.length) % galleryData.length;
    atualizarFoto();
};

window.fecharGaleria = function() {
    playSound('click');
    document.getElementById('gallery-box').classList.add('hidden');
    STATE.isPaused = false;
};

// Comandos do HUD
window.comando = function(tipo) {
    playSound('click');
    const text = document.getElementById('battle-text');
    if (tipo === 'LUTAR') {
        text.innerText = "GUI usou ABRAÇO em LULU! É super efetivo ❤️";
        document.getElementById('hp-enemy').style.width = "45%";
        document.getElementById('hp-enemy').classList.add('hp-low');
    } else if (tipo === 'POKéMON') {
        STATE.isPaused = true;
        document.getElementById('gallery-box').classList.remove('hidden');
        atualizarFoto();
    } else if (tipo === 'MOCHILA') {
        text.innerText = "Você encontrou pupunha e miojo! HP restaurado ❤️";
        document.getElementById('hp-player').style.width = "100%";
    } else {
        text.innerText = "Você não pode fugir de tanto carinho!";
    }
    setTimeout(() => { if (!STATE.isPaused) text.innerText = "O que GUI irá fazer?"; }, 3000);
};

// Mostrar Info Pokémon (mantenha o código typewriter anterior)
window.mostrarInfo = function(pokeId) {
    playSound('click');
    STATE.isPaused = true; clearTimeout(STATE.typingTimer);
    const info = pokeData[pokeId];
    const container = document.getElementById(`${pokeId}-container`);
    const sprite = container.querySelector('.pixel-sprite');
    sprite.classList.remove('walking', 'facing-back', 'facing-side', 'flip');
    sprite.classList.add('facing-front');
    container.style.transition = "none";
    document.getElementById('poke-gif').src = info.gif;
    document.getElementById('poke-name').innerText = info.nome;
    document.getElementById('info-box').classList.remove('hidden');
    const desc = document.getElementById('poke-desc');
    const fullText = `NASCIMENTO: ${info.aniversario}\nJEITO: ${info.jeito}\nCOMIDA: ${info.comida}\n\n"${info.frase}"`;
    desc.innerText = ""; let i = 0;
    function type() {
        if (i < fullText.length) { desc.innerText += fullText.charAt(i); i++; STATE.typingTimer = setTimeout(type, 30); }
    }
    type();
};

window.fecharInfo = function() { playSound('click'); document.getElementById('info-box').classList.add('hidden'); STATE.isPaused = false; };