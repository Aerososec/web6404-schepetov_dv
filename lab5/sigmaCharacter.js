// Класс персонажа
class SigmaCharacter {
    constructor(name, description, type, consent) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.consent = consent;
    }

    print() {
        console.log(`Персонаж: ${this.name}`);
        console.log(`Описание: ${this.description}`);
        console.log(`Тип: ${this.type}`);
        console.log(`Кто прислал: ${this.consent ? 'Сигма' : 'Нормис'}`);
    }
}


document.addEventListener('DOMContentLoaded', function() {
    
    const form = document.getElementById('suggestForm');
    const nameInput = document.getElementById('name');
    const descriptionInput = document.getElementById('description');
    const typeSelect = document.getElementById('type');
    const consentCheckbox = document.getElementById('consent');
    
   
    nameInput.addEventListener('input', function() {
        const hint = document.getElementById('nameHint');
        const name = this.value.trim();
        
        if (name.length === 0) {
            showHint(hint, 'Введите имя персонажа', 'error');
            return;
        }
        
        if (name.length < 2) {
            showHint(hint, 'Имя должно содержать минимум 2 символа', 'error');
        } else if (name.length > 30) {
            showHint(hint, 'Имя не должно превышать 30 символов', 'error');
        } else if (!/^[a-zA-Zа-яА-ЯёЁ\s\-]+$/i.test(name)) {
            showHint(hint, 'Имя может содержать только буквы, пробелы и дефисы', 'error');
        } else {
            showHint(hint, 'Имя корректно', 'valid');
        }
    });
    
    
    descriptionInput.addEventListener('input', function() {
        const hint = document.querySelector('#description + .hint');
        const description = this.value.trim();
        
        if (description.length === 0) {
            showHint(hint, 'Объясните, почему персонаж сигма', 'error');
            return;
        }
        
        if (description.length < 10) {
            showHint(hint, 'Описание должно содержать минимум 10 символов', 'error');
        } else if (description.length > 200) {
            showHint(hint, 'Описание не должно превышать 200 символов', 'error');
        } else {
            showHint(hint, 'Описание корректно', 'valid');
        }
    });
    
    
    typeSelect.addEventListener('change', function() {
        const hint = document.getElementById('typeHint');
        
        if (!this.value) {
            showHint(hint, 'Пожалуйста, выберите тип персонажа', 'error');
        } else {
            showHint(hint, `Выбран тип: ${this.value}`, 'valid');
        }
    });
    
    
    consentCheckbox.addEventListener('change', function() {
        const hint = document.getElementById('consentHint');
        
        if (!this.checked) {
            showHint(hint, 'Для отправки необходимо подтверждение', 'error');
        } else {
            showHint(hint, 'Подтверждение получено', 'valid');
        }
    });
    
   
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

       
        if (!validateAllFields()) {
            showResult('Пожалуйста, исправьте ошибки в форме', 'error');
            return;
        }

        const characterData = new SigmaCharacter(
            nameInput.value.trim(),
            descriptionInput.value.trim(),
            typeSelect.value,
            consentCheckbox.checked 
        )
        characterData.print()
        showResult('Отправка данных на сервер...', '');

        try {
            const response = await fetch('http://localhost:3000/sigma-characters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(characterData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ошибка: ${response.status}`);
            }

            const result = await response.json();
            console.log('Ответ сервера:', result);

            
            form.reset();
            resetAllHints();
            
            
        } catch (error) {
            console.error('Ошибка отправки:', error);
            showResult(`Ошибка соединения с сервером: ${error.message}`, 'error');
        }
    });
    
   
    async function loadCharactersTable() {
        console.log('Запуск загрузки таблицы...');
        
        const tableContainer = document.getElementById('charactersTable');
        const lastUpdateEl = document.getElementById('lastUpdate');
        
        if (!tableContainer) {
            console.error('ОШИБКА: Не найден элемент charactersTable');
            return;
        }
        
        try {
            
            tableContainer.innerHTML = '<p class="loading-message">Загрузка данных с сервера...</p>';
            
            const response = await fetch('http://localhost:3000/sigma-characters');
            
            if (!response.ok) {
                throw new Error(`HTTP ошибка: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Получены данные:', data);
            
    
            if (lastUpdateEl) {
                lastUpdateEl.textContent = `Последнее обновление: ${new Date().toLocaleTimeString()}`;
            }
            
    
            if (!data.data || !Array.isArray(data.data)) {
                throw new Error('Некорректный формат данных от сервера');
            }
            
            if (data.data.length === 0) {
                tableContainer.innerHTML = '<p class="loading-message">На сервере пока нет персонажей</p>';
                return;
            }
            
            let tableHTML = `
                <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <thead>
                        <tr style="background: #444; color: white;">
                            <th style="padding: 10px;">Имя</th>
                            <th style="padding: 10px;">Тип</th>
                            <th style="padding: 10px;">Описание</th>
                            <th style="padding: 10px;">Отправитель</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            data.data.forEach(character => {
                tableHTML += `
                    <tr>
                        <td style="padding: 8px;">
                            <strong>${character.name || 'Без имени'}</strong>
                        </td>
                        <td style="padding: 8px;">
                            ${character.type || 'Не указан'}
                        </td>
                        <td style="padding: 8px;">
                            ${character.description || 'Нет описания'}
                        </td>
                        <td style="padding: 8px;">
                            ${character.consent ? 'Сигма' : 'Нормис'}
                        </td>
                    </tr>
                `;
            });
            
            tableHTML += '</tbody></table>';
            tableContainer.innerHTML = tableHTML;
            
            console.log(`Таблица создана: ${data.data.length} персонажей`);
            
        } catch (error) {
            console.error('Ошибка загрузки таблицы:', error);
            
            tableContainer.innerHTML = `
                <div style="background: #f8d7da; padding: 15px; border-radius: 5px; color: #721c24;">
                    <p><strong>Ошибка загрузки данных</strong></p>
                    <p>${error.message}</p>
                    <p><strong>Попробуйте обновить страницу</strong></p>
                </div>
            `;
        }
    }
    
    function startPeriodicUpdates() {
        console.log('Запуск периодического обновления');
        
        loadCharactersTable();
        
        setInterval(() => {
            console.log('Автоматическое обновление...');
            loadCharactersTable();
        }, 300000);  
        
    }
    
 
    function showHint(element, message, type) {
        if (element) {
            element.textContent = message;
            element.className = 'hint ' + type;
        }
    }
    
    function showResult(message, type) {
        const result = document.getElementById('result');
        if (result) {
            result.textContent = message;
            result.className = 'hint ' + type;
        }
    }
    
    function validateAllFields() {
        let isValid = true;
        
        const name = nameInput.value.trim();
        if (name.length < 2 || name.length > 30) {
            showHint(document.getElementById('nameHint'), 
                    'Имя должно содержать от 2 до 30 символов', 'error');
            isValid = false;
        }

        const description = descriptionInput.value.trim();
        const descHint = document.querySelector('#description + .hint');
        if (description.length < 10 || description.length > 200) {
            showHint(descHint, 
                    'Описание должно содержать от 10 до 200 символов', 'error');
            isValid = false;
        }

        if (!typeSelect.value) {
            showHint(document.getElementById('typeHint'), 
                    'Пожалуйста, выберите тип персонажа', 'error');
            isValid = false;
        }

        if (!consentCheckbox.checked) {
            showHint(document.getElementById('consentHint'), 
                    'Для отправки необходимо подтверждение', 'error');
            isValid = false;
        }
        
        return isValid;
    }
    
    function resetAllHints() {
        document.querySelectorAll('.hint').forEach(hint => {
            hint.textContent = '';
            hint.className = 'hint';
        });
    }
    

    startPeriodicUpdates();
    
}); 