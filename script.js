const cards = document.querySelectorAll('.secret-card__item');
const decks = document.querySelectorAll('.deck');
const container = document.querySelector('.secret-card__container');
const secretCardList = document.querySelector('.secret-card__list');
const undoSecretCardBtn = document.querySelector('.undo-secret-card-btn');

let lastMovedCardInfo = null;

function getLastSlot(deck) {
    const allSlots = deck.querySelectorAll('.slot__frame');
    return allSlots[allSlots.length - 1] || null;
}

function isLastSlotOccupied(deck) {
    const lastSlot = getLastSlot(deck);
    if (!lastSlot) return true;

    return !!lastSlot.querySelector('.secret-card__item');
}

function clearActiveDeck() {
    decks.forEach(deck => deck.classList.remove('active-deck'));
}

function updateDeckStates() {
    decks.forEach(deck => {
        if (isLastSlotOccupied(deck)) {
            deck.classList.add('deck-disabled');
            deck.classList.remove('active-deck');
        } else {
            deck.classList.remove('deck-disabled');
        }
    });
}

function getSelectedDeck() {
    return document.querySelector('.deck.active-deck');
}

function revealCardWithMagic(card) {
    const innerCard = card.querySelector('.card-inner');
    if (!innerCard) return;

    if (card.classList.contains('is-revealing') || innerCard.classList.contains('is-flipped')) return;

    card.classList.add('is-revealing');

    const onRevealEnd = () => {
        card.classList.remove('is-revealing');
        innerCard.classList.add('is-flipped');
        card.removeEventListener('animationend', onRevealEnd);
    };

    card.addEventListener('animationend', onRevealEnd);
}

decks.forEach(deck => {
    deck.addEventListener('click', function (event) {
        event.stopPropagation();

        if (deck.classList.contains('deck-disabled')) return;

        clearActiveDeck();
        deck.classList.add('active-deck');
    });
});

function FLIP_moveToSlot(movingCard) {
    const selectedDeck = getSelectedDeck();
    if (!selectedDeck) return;

    const targetSlot = getLastSlot(selectedDeck);
    if (!targetSlot) return;

    if (targetSlot.querySelector('.secret-card__item')) return;
    const firstRect = movingCard.getBoundingClientRect();

    movingCard.classList.remove('is-active');

    lastMovedCardInfo = {
    card: movingCard,
    fromParent: secretCardList,
    nextSibling: movingCard.nextElementSibling
};


    targetSlot.appendChild(movingCard);

    const lastRect = movingCard.getBoundingClientRect();

    const deltaX = firstRect.left - lastRect.left;
    const deltaY = firstRect.top - lastRect.top;
    const scaleX = firstRect.width / lastRect.width;
    const scaleY = firstRect.height / lastRect.height;

    movingCard.style.transition = 'none';
    movingCard.style.transformOrigin = 'top left';
    movingCard.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;

    movingCard.offsetHeight;

    movingCard.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
    movingCard.style.transform = 'translate(0, 0) scale(1, 1)';

    if (container) {
        container.classList.remove('has-active-card');
    }

    movingCard.addEventListener('transitionend', function cleanup(e) {
        if (e.propertyName === 'transform') {
            movingCard.style.transition = '';
            movingCard.style.transform = '';
            movingCard.style.transformOrigin = '';
            movingCard.removeEventListener('transitionend', cleanup);
        }
    });

    selectedDeck.classList.remove('active-deck');

    updateDeckStates();
}


function returnLastSecretCard() {
    if (!lastMovedCardInfo) return;

    const { card, fromParent, nextSibling } = lastMovedCardInfo;
    const innerCard = card.querySelector('.card-inner');

    // Возвращаем карту обратно в веер
    if (nextSibling && nextSibling.parentNode === fromParent) {
        fromParent.insertBefore(card, nextSibling);
    } else {
        fromParent.appendChild(card);
    }

    // Сбрасываем состояния карты
    card.classList.remove('is-active', 'is-revealing');

    if (innerCard) {
        innerCard.classList.remove('is-flipped');
    }

    card.style.transition = '';
    card.style.transform = '';
    card.style.transformOrigin = '';

    if (container) {
        container.classList.remove('has-active-card');
    }

    clearActiveDeck();
    updateDeckStates();

    lastMovedCardInfo = null;
    updateUndoButtonState();
}

if (cards.length > 0) {
    cards.forEach(card => {
        card.addEventListener('click', function (event) {
            event.stopPropagation();

            if (card.closest('.slot__frame')) return;

            const innerCard = card.querySelector('.card-inner');
            const isActive = card.classList.contains('is-active');
            const isFlipped = innerCard.classList.contains('is-flipped');

            if (!isActive) {
                cards.forEach(c => {
                    if (!c.closest('.slot__frame')) {
                        c.classList.remove('is-active');
                    }
                });

                card.classList.add('is-active');
                if (container) container.classList.add('has-active-card');
            }

            else if (isActive && !isFlipped) {
                revealCardWithMagic(card);
            }

            else if (isActive && isFlipped) {
                const selectedDeck = getSelectedDeck();

                if (!selectedDeck) return;

                if (isLastSlotOccupied(selectedDeck)) {
                    updateDeckStates();
                    return;
                }

                FLIP_moveToSlot(card);
            }
        });
    });

    document.addEventListener('click', function (event) {
        if (!event.target.closest('.secret-card__item') && !event.target.closest('.deck')) {
            cards.forEach(c => {
                if (!c.closest('.slot__frame')) {
                    c.classList.remove('is-active');
                }
            });

            if (container) container.classList.remove('has-active-card');
        }
    });
}

if (undoSecretCardBtn) {
    undoSecretCardBtn.addEventListener('click', returnLastSecretCard);
}

updateDeckStates();