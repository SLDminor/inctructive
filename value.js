// Функция для загрузки и применения данных о стоимости
async function loadCardCosts() {
    try {
        // 1. Скачиваем файл data.json (он должен лежать рядом с HTML)
        const response = await fetch('data.json');
        
        if (!response.ok) {
            throw new Error('Не удалось загрузить файл с данными карт');
        }

        // 2. Превращаем скачанный файл в удобный JS-объект
        const cardData = await response.json();

        // 3. Находим ВСЕ картинки карт на странице
        const allCardImages = document.querySelectorAll('.character__image');

        // 4. Проходимся по каждой картинке циклом
        allCardImages.forEach(image => {
            
            const cardId = image.id; // Получаем ID (например, 'fire-spirits')

            // Проверяем, есть ли такой ID в нашем файле data.json
            if (cardData.hasOwnProperty(cardId)) {
                
                const cost = cardData[cardId]; // Достаем стоимость (например, 1)

                // Теперь нам нужно найти ТОЛЬКО тот span, который относится к ЭТОЙ картинке.
                // Для этого мы поднимаемся к общему родителю (.character__info)
                // и ищем span.coin__value уже внутри него.
                const parentBlock = image.closest('.character__info');
                
                if (parentBlock) {
                    const valueSpan = parentBlock.querySelector('.coin__value');
                    
                    if (valueSpan) {
                        // Вставляем цифру в HTML!
                        valueSpan.textContent = cost;
                    }
                }
            } else {
                console.warn(`В data.json нет стоимости для карты с ID: ${cardId}`);
            }
        });

    } catch (error) {
        console.error("Ошибка при загрузке стоимости карт:", error);
    }
}

// Запускаем функцию, как только страница (DOM) полностью загрузилась
document.addEventListener('DOMContentLoaded', () => {
    loadCardCosts();
});