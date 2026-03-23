const characterImages = document.querySelectorAll('.character__image');

let activePopoverContainer = null;
let activeTrigger = null;

function createPopoverContent(image) {
    const imageSrc = image.getAttribute('src') || '';
    const fileName = imageSrc.split('/').pop() || 'Персонаж';
    const characterName = fileName.replace(/\.[^.]+$/, '');

    return `
        <div class="popover__title">${characterName}</div>
        <div class="popover__colors">
            <button class="popover__color color-one" type="button" aria-label="Первая команда"></button>
            <button class="popover__color color-two" type="button" aria-label="Вторая команда"></button>
            <button class="popover__color color-three" type="button" aria-label="Третья команда"></button>
            <button class="popover__color color-four" type="button" aria-label="Четверта команда"></button>
            <button class="popover__color color-five" type="button" aria-label="Пятая команда"></button>
            <button class="popover__color color-six" type="button" aria-label="Шестая команда"></button>
            <button class="popover__color color-seven" type="button" aria-label="Седьмая команда"></button>
            <button class="popover__color color-eight" type="button" aria-label="Восьмая команда"></button>
        </div>
        <button class="popover__remove">Убрать</button>
    `;
}

function removeCharacter(id) {
    const data = JSON.parse(localStorage.getItem('teamsData')) || { characters: [] };

    data.characters = data.characters.filter(c => c.id !== id);

    localStorage.setItem('teamsData', JSON.stringify(data));
}

function canAddMoreCharacters() {
    const data = JSON.parse(localStorage.getItem('teamsData')) || { characters: [] };
    return data.characters.length < 7;
}

function closePopover() {
    if (activePopoverContainer) {
        activePopoverContainer.remove();
        activePopoverContainer = null;
    }

    if (activeTrigger) {
        activeTrigger.classList.remove('character__image--active');
        activeTrigger = null;
    }
}

function saveCharacter(id, image, team) {
    const data = JSON.parse(localStorage.getItem('teamsData')) || { characters: [] };

    // удаляем старую запись
    data.characters = data.characters.filter(c => c.id !== id);

    // добавляем новую
    data.characters.push({
        id,
        image,
        team
    });

    localStorage.setItem('teamsData', JSON.stringify(data));
}

function positionPopover(trigger, popoverContainer, popoverElement) {
    const targetRect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const gap = 14;

    popoverElement.classList.remove(
        'arrow-top',
        'arrow-bottom',
        'arrow-left',
        'arrow-right'
    );

    let top = targetRect.top - popoverContainer.offsetHeight - gap;
    let left = targetRect.left + (targetRect.width / 2) - (popoverContainer.offsetWidth / 2);

    // По умолчанию открываем сверху, стрелка вниз
    popoverElement.classList.add('arrow-bottom');

    // Если не помещается сверху — открываем снизу
    if (top < 8) {
        top = targetRect.bottom + gap;
        popoverElement.classList.remove('arrow-bottom');
        popoverElement.classList.add('arrow-top');
    }

    // Если вылезает справа — прижимаем к правому краю
    if (left + popoverContainer.offsetWidth > viewportWidth - 8) {
        left = viewportWidth - popoverContainer.offsetWidth - 8;
    }

    // Если вылезает слева — прижимаем к левому краю
    if (left < 8) {
        left = 8;
    }

    // Если не помещается ни сверху, ни снизу — пробуем справа
    const fitsAbove = targetRect.top - popoverContainer.offsetHeight - gap >= 8;
    const fitsBelow = targetRect.bottom + popoverContainer.offsetHeight + gap <= viewportHeight - 8;

    if (!fitsAbove && !fitsBelow) {
        top = targetRect.top + (targetRect.height / 2) - (popoverContainer.offsetHeight / 2);
        left = targetRect.right + gap;

        popoverElement.classList.remove('arrow-top', 'arrow-bottom');
        popoverElement.classList.add('arrow-left');

        if (left + popoverContainer.offsetWidth > viewportWidth - 8) {
            left = targetRect.left - popoverContainer.offsetWidth - gap;
            popoverElement.classList.remove('arrow-left');
            popoverElement.classList.add('arrow-right');
        }

        if (top < 8) top = 8;
        if (top + popoverContainer.offsetHeight > viewportHeight - 8) {
            top = viewportHeight - popoverContainer.offsetHeight - 8;
        }
    }

    popoverContainer.style.top = `${top}px`;
    popoverContainer.style.left = `${left}px`;
}

function openPopover(trigger) {
    closePopover();

    const popoverContainer = document.createElement('div');
    popoverContainer.className = 'popover-container';

    const popoverElement = document.createElement('div');
    popoverElement.className = 'popover';
    popoverElement.innerHTML = createPopoverContent(trigger);
    popoverElement.querySelectorAll('.popover__color').forEach(colorBtn => {
        colorBtn.addEventListener('click', () => {
            const id = trigger.id;
            const teamval = colorBtn.classList[1]; // color-one, color-two...

            const data = JSON.parse(localStorage.getItem('teamsData')) || { characters: [] };

            // сколько уже в этой команде
            const teamCount = data.characters.filter(c => c.team === teamval).length;

            // есть ли уже этот персонаж
            const alreadyExists = data.characters.some(c => c.id === id);

            // если это новый персонаж и команда уже заполнена
            if (!alreadyExists && teamCount >= 7) {
                alert('В этой команде уже 7 персонажей');
                return;
            }
            const color = window.getComputedStyle(colorBtn).backgroundColor;

            // сохраняем цвет в data-атрибут
            trigger.closest('.character__item')
                .style.setProperty('--team-color', color);

            trigger.closest('.character__item')
                .setAttribute('data-team-color', 'true');

            // --- СОХРАНЕНИЕ ---
            const imageSrc = trigger.getAttribute('src');

            // определяем номер команды (1-8)
            const team = Array.from(colorBtn.classList)
                .find(cls => cls.startsWith('color-'));

            saveCharacter(id, imageSrc, team);
            // закрываем поповер
            closePopover();
        });
    });

    popoverContainer.appendChild(popoverElement);
    document.body.appendChild(popoverContainer);

    positionPopover(trigger, popoverContainer, popoverElement);

    activePopoverContainer = popoverContainer;
    activeTrigger = trigger;
    activeTrigger.classList.add('character__image--active');

    popoverElement.querySelector('.popover__remove').addEventListener('click', () => {
        const characterItem = trigger.closest('.character__item');

        // убираем цвет
        characterItem.style.removeProperty('--team-color');
        characterItem.removeAttribute('data-team-color');

        // удаляем из localStorage
        removeCharacter(trigger.id);

        closePopover();
    });
}

function updateCharactersState() {
    const data = JSON.parse(localStorage.getItem('teamsData')) || { characters: [] };

    if (data.characters.length >= 7) {
        document.querySelectorAll('.character__image').forEach(img => {
            const exists = data.characters.some(c => c.id === img.id);

            if (!exists) {
                img.classList.add('disabled');
            }
        });
    } else {
        document.querySelectorAll('.character__image').forEach(img => {
            img.classList.remove('disabled');
        });
    }
}

characterImages.forEach((image) => {
    image.addEventListener('click', (event) => {
        event.stopPropagation();

        if (activeTrigger === image) {
            closePopover();
            return;
        }

        openPopover(image);
    });
});

document.addEventListener('click', (event) => {
    if (!activePopoverContainer) return;

    const clickedInsidePopover = activePopoverContainer.contains(event.target);
    const clickedOnCharacter = event.target.closest('.character__image');

    if (!clickedInsidePopover && !clickedOnCharacter) {
        closePopover();
    }
});

window.addEventListener('resize', () => {
    if (!activePopoverContainer || !activeTrigger) return;

    const popoverElement = activePopoverContainer.querySelector('.popover');
    if (!popoverElement) return;

    positionPopover(activeTrigger, activePopoverContainer, popoverElement);
});

window.addEventListener('scroll', () => {
    if (!activePopoverContainer || !activeTrigger) return;

    const popoverElement = activePopoverContainer.querySelector('.popover');
    if (!popoverElement) return;

    positionPopover(activeTrigger, activePopoverContainer, popoverElement);
}, true);
