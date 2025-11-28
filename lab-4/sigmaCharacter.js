class SigmaCharacter {
    constructor(name, type, consent) {
        this.name = name;
        this.type = type;
        this.consent = consent;
    }

    print() {
        console.log(`Персонаж: ${this.name}`);
        console.log(`Тип: ${this.type}`);
        console.log(`Кто прислал: ${this.consent ? 'Сигма' : 'Нормис'}`);
    }
}


document.getElementById('suggestForm').addEventListener('submit', function(e) {
    e.preventDefault(); // чтобы страница не перезагружалась

    const name = document.getElementById('name').value;
    const type = document.getElementById('type').value;
    const consent = document.getElementById('consent').checked;

    const character = new SigmaCharacter(name, type, consent);
    character.print();

    alert('Ваш персонаж отправлен! Проверьте консоль для проверки.');
    this.reset();
});