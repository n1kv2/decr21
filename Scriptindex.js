const HASHED_PASSWORD = "f8cb599d9ba7edcebd8fda08ae5d366461ee02dfdd17ae2274f079895815024a"; // Hash psw
const CORRECT_COMBINATION_HASH = "edf47512eec1fbc8389dda7f4212505250ef02cc376487bdc8abefe8489cb035"; // Hash lucchetto
let isUnlocked = false;
let currentCombination = ["0", "0", "0", "0"]; //iniz. combinazione

function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    return crypto.subtle.digest('SHA-256', data).then(hash => {
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    });
}

// 1 fase
document.getElementById('unlockBtn').addEventListener('click', async () => {
    const password = document.getElementById('passwordInput').value;
    const hashedPassword = await hashPassword(password);

    if (hashedPassword === HASHED_PASSWORD) {
        // Sblocca la prima fase
        isUnlocked = true;
        document.querySelector('.led-red').classList.remove('active');
        document.querySelector('.led-green').classList.add('active');

        
        sessionStorage.setItem('isUnlocked', 'true');
        // Nasconde il messaggio di errore quando si sbaglia almeno una volta la password e poi si fa giusta
        document.getElementById('warningMessage').style.display = 'none';
        
        // questo mostra la 2 fase
        document.getElementById('secondStep').style.display = 'block';
    } else {
        alert("Password errata!");
        document.getElementById('warningMessage').textContent = "Il servizio è bloccato. Inserisci la combinazione di sblocco.";
        document.getElementById('warningMessage').style.display = 'block';
    }
});

// cambio numeri del lucchetto de ddio
document.querySelectorAll('.rotella').forEach((rotella, index) => {
    rotella.addEventListener('click', () => {
        let currentNumber = parseInt(rotella.querySelector('.number').textContent);
        currentNumber = (currentNumber + 1) % 10; 
        rotella.querySelector('.number').textContent = currentNumber;
        currentCombination[index] = currentNumber.toString(); 
    });
});

// 2 fase
document.getElementById('unlockCombinationBtn').addEventListener('click', async () => {
    const enteredCombination = currentCombination.join('');
    const hashedCombination = await hashPassword(enteredCombination); 

    if (hashedCombination === CORRECT_COMBINATION_HASH) {
        document.getElementById('combinationMessage').textContent = "Corretto! A breve ti indirizziamo nella pagina...";
        document.getElementById('combinationMessage').style.color = "green";
        document.getElementById('combinationMessage').style.display = 'block';

        // Reindirizza dopo 3 secondi
        setTimeout(() => {
            window.location.href = "codestart.html";
        }, 3000);
    } else {
        document.getElementById('combinationMessage').textContent = "Combinazione errata! Riprova";
        document.getElementById('combinationMessage').style.color = "red";
        document.getElementById('combinationMessage').style.display = 'block';
    }
});