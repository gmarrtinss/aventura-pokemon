// src/main.js
import { pokeData, galleryData, loveLetters } from './js/data.js';

const STATE = {
    isPaused: false,
    typingTimer: null,
    currentPhoto: 0,
    xp: 0,
    maxXP: galleryData.length
};

const sounds = {
    music: document.getElementById('bg-music'),
    open: document.getElementById('sound-open'),
    click: document.getElementById('sound-click')
};

const ORIGINAL_VOLUME = 0.3;
const SOFT_VOLUME = 0.1;

function playSound(id) {
    if (sounds[id]) {
        sounds[id].currentTime = 0;
        sounds[id].play().catch(e => console.log("Áudio bloqueado", e));
    }
}

function criarEfeitoCoracoes(pokeId) {
    const container = document.getElementById(`${pokeId}-container`);
    if (!container) return;
    const numeroDeCoracoes = 6;
    for (let i = 0; i < numeroDeCoracoes; i++) {
        const coracao = document.createElement('span');
        coracao.innerText = '❤️';
        coracao.className = 'particle-heart';
        const x = (Math.random() - 0.5) * 120;
        const y = -Math.random() * 100 - 60;
        const rotation = (Math.random() - 0.5) * 45;
        const delay = Math.random() * 0.2;
        coracao.style.setProperty('--target-x', `${x}px`);
        coracao.style.setProperty('--target-y', `${y}px`);
        coracao.style.setProperty('--target-r', `${rotation}deg`);
        coracao.style.animationDelay = `${delay}s`;
        container.appendChild(coracao);
        setTimeout(() => coracao.remove(), 1000);
    }
}

window.addEventListener('click', (e) => {
    if (e.target.id === 'gallery-box') fecharGaleria();
    if (e.target.id === 'info-overlay') fecharInfo();
    if (e.target.id === 'letter-overlay') fecharCartinha();
});

function atualizarDirecao(el, deltaX, deltaY) {
    const sprite = el.querySelector('.pixel-sprite');
    sprite.classList.remove('facing-front', 'facing-back', 'facing-side');
    sprite.style.setProperty('--flip', '1');
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        sprite.classList.add('facing-side');
        if (deltaX > 0) sprite.style.setProperty('--flip', '-1');
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
            const moverNoEixoX = Math.random() > 0.5;
            let nX = curX, nY = curY;
            if (moverNoEixoX) { nX = Math.floor(Math.random() * 60) + 20; } 
            else { nY = Math.floor(Math.random() * 50) + 20; }
            const dist = moverNoEixoX ? Math.abs(nX - curX) : Math.abs(nY - curY);
            if (dist > 5) {
                const velocidade = 12; 
                const tempo = dist / velocidade; 
                atualizarDirecao(el, nX - curX, nY - curY);
                const prop = moverNoEixoX ? 'left' : 'top';
                el.style.transition = `${prop} ${tempo}s linear`;
                sprite.classList.add('walking');
                el.style.left = `${nX}%`; el.style.top = `${nY}%`;
                setTimeout(() => sprite.classList.remove('walking'), tempo * 1000);
            }
        }
    }, 4000);
}

window.abrirPokebola = function() {
    playSound('open');
    if (sounds.music) { sounds.music.volume = ORIGINAL_VOLUME; sounds.music.play(); }
    const sprite = document.getElementById('pokebola-sprite');
    const mapImg = document.getElementById('map-img');
    
    const hora = new Date().getHours();
    if (hora >= 18 || hora <= 6) mapImg.classList.add('night-mode');

    if (Math.random() <= 0.01) {
        document.querySelector('.snorlax-sprite').classList.add('shiny-effect');
    }

    sprite.classList.remove('animate-float');
    setTimeout(() => sprite.classList.replace('facing-closed', 'facing-intermediate'), 300);
    setTimeout(() => {
        sprite.classList.replace('facing-intermediate', 'facing-open-light');
        document.getElementById('flash-effect').style.opacity = '1';
    }, 800);
    setTimeout(() => {
        document.getElementById('flash-effect').style.opacity = '0';
        document.getElementById('intro-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('intro-screen').classList.add('hidden');
            document.getElementById('main-game').classList.remove('hidden');
            iniciarIA('gengar-container', 0.6); 
            iniciarIA('snorlax-container', 0.4);
        }, 800);
    }, 1500);
};

function atualizarFoto() {
    const photo = galleryData[STATE.currentPhoto];
    document.getElementById('gallery-photo').src = photo.url;
    if (STATE.xp >= STATE.maxXP) {
        document.getElementById('gallery-caption').innerHTML = `⭐ <b>Vínculo Evoluído! Nosso amor subiu de nível!</b> ⭐`;
    } else { document.getElementById('gallery-caption').innerText = photo.legenda; }
}

window.navegarGaleria = function(dir) {
    playSound('click');
    STATE.currentPhoto = (STATE.currentPhoto + dir + galleryData.length) % galleryData.length;
    if (STATE.xp < STATE.maxXP) STATE.xp++;
    atualizarFoto();
};

window.fecharGaleria = function() {
    if (sounds.music) sounds.music.volume = ORIGINAL_VOLUME;
    document.getElementById('gallery-box').classList.add('hidden');
    STATE.isPaused = false;
};

window.comando = function(tipo) {
    playSound('click');
    const text = document.getElementById('battle-text');
    const enemySprite = document.querySelector('.snorlax-sprite');
    const snorlaxContainer = document.getElementById('snorlax-container');

    if (tipo === 'LUTAR') {
        text.innerText = "GUI usou ABRAÇO! Super efetivo ❤️";
        enemySprite.classList.add('animate-shake');
        setTimeout(() => enemySprite.classList.remove('animate-shake'), 400);
        document.getElementById('hp-enemy').style.width = "45%";
    } else if (tipo === 'POKéMON') {
        STATE.isPaused = true;
        if (sounds.music) sounds.music.volume = SOFT_VOLUME;
        document.getElementById('gallery-box').classList.remove('hidden');
        atualizarFoto();
    } else if (tipo === 'MOCHILA') {
        text.innerText = "LULU ganhou Pupunha e Miojo! Ela te ama! ❤️";
        const heart = document.createElement('span');
        heart.innerText = '💖';
        heart.className = 'mimo-heart';
        snorlaxContainer.appendChild(heart);
        setTimeout(() => heart.remove(), 1500);
        document.getElementById('hp-player').style.width = "100%";
    } else { text.innerText = "Não dá para fugir!"; }
    setTimeout(() => { if (!STATE.isPaused) text.innerText = "O que GUI irá fazer?"; }, 3000);
};

window.abrirCartinha = function() {
    playSound('open');
    const index = Math.floor(Math.random() * loveLetters.length);
    document.getElementById('letter-text').innerText = loveLetters[index];
    document.getElementById('letter-overlay').classList.remove('hidden');
};

window.fecharCartinha = function() {
    playSound('click');
    document.getElementById('letter-overlay').classList.add('hidden');
};

window.mostrarInfo = function(pokeId) {
    playSound('click');
    STATE.isPaused = true;
    clearTimeout(STATE.typingTimer);
    criarEfeitoCoracoes(pokeId);
    const info = pokeData[pokeId];
    const container = document.getElementById(`${pokeId}-container`);
    const sprite = container.querySelector('.pixel-sprite');
    sprite.classList.remove('walking', 'facing-back', 'facing-side');
    sprite.style.setProperty('--flip', '1');
    sprite.classList.add('facing-front');
    document.getElementById('poke-gif').src = info.gif;
    document.getElementById('poke-name').innerText = info.nome;
    document.getElementById('info-box').classList.remove('hidden');
    document.getElementById('info-overlay').classList.remove('hidden');
    const desc = document.getElementById('poke-desc');
    const fullText = `NASCIMENTO: ${info.aniversario}\nJEITO: ${info.jeito}\nCOMIDA: ${info.comida}\n\n"${info.frase}"`;
    desc.innerText = ""; 
    let i = 0;
    function type() {
        if (i < fullText.length) { 
            desc.innerText += fullText.charAt(i); 
            i++; 
            STATE.typingTimer = setTimeout(type, 30); 
        }
    }
    type();
};

window.fecharInfo = function() {
    playSound('click');
    document.getElementById('info-box').classList.add('hidden');
    document.getElementById('info-overlay').classList.add('hidden');
    STATE.isPaused = false;
};