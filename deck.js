function loadData() {
    return JSON.parse(localStorage.getItem('teamsData')) || { characters: [] };
}

function getDeck(team) {
    return document.querySelector(`.deck[data-team="${team}"]`);
}

function getFreeSlot(deck) {
    const slots = deck.querySelectorAll('.slot__frame');
    return Array.from(slots).find(slot => !slot.children.length);
}

function createCard(image) {
    const card = document.createElement('div');
    card.className = 'secret-card__item';

    card.innerHTML = `
        <img src="${image}" class="secret-card__image">
    `;

    return card;
}

function renderDecks() {
    const data = loadData();

    data.characters.forEach(character => {
        const deck = getDeck(character.team);
        if (!deck) return;

        const slot = getFreeSlot(deck);
        if (!slot) return;

        const card = createCard(character.image);
        slot.appendChild(card);
    });
}

function clearDecks() {
    // 1. очищаем localStorage
    localStorage.removeItem('teamsData');

    // 2. очищаем слоты
    document.querySelectorAll('.slot__frame').forEach(slot => {
        slot.innerHTML = '';
    });

    // (опционально) если есть активные классы
    document.querySelectorAll('.deck').forEach(deck => {
        deck.classList.remove('active-deck');
    });
}

document.addEventListener('DOMContentLoaded', renderDecks);

document.querySelector('.clear-decks-btn').addEventListener('click', () => {

    if (!confirm('Очистить все колоды?')) return;

    clearDecks();
});