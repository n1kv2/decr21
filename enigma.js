
const ROTORS = {
  I: { wiring: "EKMFLGDQVZNTOWYHXUSPAIBRCJ", notch: 16 },
  II: { wiring: "AJDKSIRUXBLHWTMCQGZNPYFVOE", notch: 4 },
  III: { wiring: "BDFHJLCPRTXVZNYEIWGAKMUSQO", notch: 21 },
  IV: { wiring: "ESOVPZJAYQUIRHXLNFTGKDCMWB", notch: 9 },
  V: { wiring: "VZBRGITYUPSDNHLXAWMJQOFECK", notch: 25 }
};

const REFLECTORS = {
  B: "YRUHQSLDPXNGOKMIEBFZCWVJAT",
  C: "FVPJIAOYEDRZXWGCTKUQSBNMHL",
  ThinB: "ENKQAUYWJICOPBLMDXZVFTHRGS",
  ThinC: "RDOBJNTKVEHMLFCWZAXGYIPSUQ"
};

class Rotor {
  constructor(wiring, notch, ringSetting = 0, position = 0) {
      this.wiring = wiring;
      this.notch = notch;
      this.ringSetting = ringSetting;
      this.position = position;
  }

  encodeForward(c) {
      const index = ((c.charCodeAt(0) - 65 + this.position - this.ringSetting + 26) % 26);
      const encodedChar = this.wiring[index];
      return String.fromCharCode((encodedChar.charCodeAt(0) - 65 - this.position + this.ringSetting + 26) % 26 + 65);
  }

  encodeBackward(c) {
      const index = ((c.charCodeAt(0) - 65 + this.position - this.ringSetting + 26) % 26);
      const encodedChar = String.fromCharCode(this.wiring.indexOf(String.fromCharCode(index + 65)) + 65);
      return String.fromCharCode((encodedChar.charCodeAt(0) - 65 - this.position + this.ringSetting + 26) % 26 + 65);
  }

  step() {
      this.position = (this.position + 1) % 26;
      return this.position === this.notch;
  }

  getPosition() {
      return this.position;
  }

  setPosition(position) {
      this.position = position;
  }
}

class Reflector {
  constructor(wiring) {
      this.wiring = wiring;
  }

  reflect(c) {
      const index = c.charCodeAt(0) - 65;
      return this.wiring[index];
  }
}

class Plugboard {
  constructor(connections) {
      this.mapping = {};
      connections.split(" ").forEach(pair => {
          if (pair.length === 2) {
              this.mapping[pair[0]] = pair[1];
              this.mapping[pair[1]] = pair[0];
          }
      });
  }

  swap(c) {
      return this.mapping[c] || c;
  }
}

class ENMC {
  constructor(rotors, reflector, plugboard) {
      this.rotors = rotors;
      this.reflector = reflector;
      this.plugboard = plugboard;
  }

  encodeCharacter(c) {
      if (!/[A-Z]/.test(c)) {
          return c; // 
      }
      c = this.plugboard.swap(c);
      this.rotors.forEach(rotor => (c = rotor.encodeForward(c)));
      c = this.reflector.reflect(c);
      this.rotors.slice().reverse().forEach(rotor => (c = rotor.encodeBackward(c)));
      c = this.plugboard.swap(c);
      this.stepRotors();
      return c;
  }

  stepRotors() {
      if (this.rotors[0].step()) {
          if (this.rotors[1].step()) {
              this.rotors[2].step();
          }
      }
  }

  getState() {
      return this.rotors.map(rotor => String.fromCharCode(rotor.getPosition() + 65));
  }

  resetRotors(positions) {
      this.rotors.forEach((rotor, index) => rotor.setPosition(positions[index]));
  }

  encodeMessage(message) {
      return message
          .toUpperCase()
          .split("")
          .map(c => /[A-Z]/.test(c) ? this.encodeCharacter(c) : c) // Mantieni spazi e altri caratteri
          .join("");
  }
}

// funz princ
document.getElementById('rotor1').addEventListener('change', () => initializeEnigma());
document.getElementById('rotor2').addEventListener('change', () => initializeEnigma());
document.getElementById('rotor3').addEventListener('change', () => initializeEnigma());
document.getElementById('ring1').addEventListener('change', () => initializeEnigma());
document.getElementById('ring2').addEventListener('change', () => initializeEnigma());
document.getElementById('ring3').addEventListener('change', () => initializeEnigma());
document.getElementById('pos1').addEventListener('change', () => initializeEnigma());
document.getElementById('pos2').addEventListener('change', () => initializeEnigma());
document.getElementById('pos3').addEventListener('change', () => initializeEnigma());
document.getElementById('reflector').addEventListener('change', () => initializeEnigma());
document.getElementById('plugboard').addEventListener('change', () => initializeEnigma());

// Funzione per inizializzare
function initializeEnigma() {
    const rotor1 = new Rotor(
        ROTORS[document.getElementById('rotor1').value].wiring,
        ROTORS[document.getElementById('rotor1').value].notch,
        parseInt(document.getElementById('ring1').value),
        document.getElementById('pos1').value.toUpperCase().charCodeAt(0) - 65
    );
    const rotor2 = new Rotor(
        ROTORS[document.getElementById('rotor2').value].wiring,
        ROTORS[document.getElementById('rotor2').value].notch,
        parseInt(document.getElementById('ring2').value),
        document.getElementById('pos2').value.toUpperCase().charCodeAt(0) - 65
    );
    const rotor3 = new Rotor(
        ROTORS[document.getElementById('rotor3').value].wiring,
        ROTORS[document.getElementById('rotor3').value].notch,
        parseInt(document.getElementById('ring3').value),
        document.getElementById('pos3').value.toUpperCase().charCodeAt(0) - 65
    );

    const reflector = new Reflector(REFLECTORS[document.getElementById('reflector').value]);
    const plugboard = new Plugboard(document.getElementById('plugboard').value.toUpperCase());

    enigma = new ENMC([rotor1, rotor2, rotor3], reflector, plugboard);
}


document.querySelectorAll('.input-keyboard button').forEach(button => {
    button.addEventListener('click', () => {
        if (!enigma) initializeEnigma();

        const letter = button.getAttribute('data-letter');
        const encodedLetter = enigma.encodeCharacter(letter);

        // Illumina la lettera 
        document.querySelectorAll('.output-letter').forEach(outputLetter => {
            outputLetter.classList.remove('active');
            if (outputLetter.getAttribute('data-letter') === encodedLetter) {
                outputLetter.classList.add('active');
            }
        });

        // Aggiorna lo stato dei rotori
        const rotorState = enigma.getState();
        document.getElementById('rotorStateDisplay').textContent = `Rotore 1: ${rotorState[0]}, Rotore 2: ${rotorState[1]}, Rotore 3: ${rotorState[2]}`;
    });
});

document.getElementById("decodeBtn").addEventListener("click", () => {
  // La decifratura è identica alla cifratura, ma non l'ho inserita (chiaramente haha)
});

// nik1v