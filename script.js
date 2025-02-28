function cv(testo, chiave, mode = "c") {
    testo = testo.toUpperCase();
    chiave = chiave.toUpperCase();
    let risultato = "";

    let chiave_indice = 0;
    for (let carattere of testo) {
        if (/[A-Z]/.test(carattere)) {
            let shift = chiave.charCodeAt(chiave_indice) - 'A'.charCodeAt(0);
            if (mode === "d") {
                shift = -shift;
            }

            let nuova_lettera = String.fromCharCode((carattere.charCodeAt(0) - 'A'.charCodeAt(0) + shift + 26) % 26 + 'A'.charCodeAt(0));
            risultato += nuova_lettera;

            chiave_indice = (chiave_indice + 1) % chiave.length;
        } else {
            risultato += carattere;
        }
    }

    return risultato;
}

function processText() {
    const testo = document.getElementById("testo").value;
    const chiave = document.getElementById("chiave").value;
    const mode = document.getElementById("mode").value;

    const risultato = cv(testo, chiave, mode);
    document.getElementById("risultato").value = risultato;
}

// nik1v