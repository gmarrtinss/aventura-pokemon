export function iniciarIA(id, frequencia) {
    const el = document.getElementById(id);
    const sprite = el.querySelector('.pixel-sprite');

    setInterval(() => {
        if (Math.random() > frequencia) { // Chance de se mover
            const novoX = Math.floor(Math.random() * 70) + 15; // Mantém no centro do mapa
            const novoY = Math.floor(Math.random() * 50) + 20;

            // Ativa animação de caminhada
            sprite.classList.add('walking');
            el.style.left = novoX + "%";
            el.style.top = novoY + "%";

            // Para de andar após chegar (3 segundos de transição no CSS)
            setTimeout(() => {
                sprite.classList.remove('walking');
            }, 3000);
        }
    }, 5000);
}