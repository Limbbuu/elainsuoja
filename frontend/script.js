// Haetaan kaikki eläimet Server A:n rajapinnasta
async function haeElaimet() {
    const animalList = document.getElementById('animal-list');

    try {
        const response = await fetch('/animals');

        if (!response.ok) {
            throw new Error('Eläinten hakeminen epäonnistui');
        }

        const animals = await response.json();

        // Tyhjennetään latausteksti
        animalList.innerHTML = '';

        if (animals.length === 0) {
            animalList.textContent = 'Eläimiä ei tällä hetkellä ole.';
            return;
        }

        // Luodaan jokaiselle eläimelle oma kortti
        animals.forEach(animal => {
            const card = document.createElement('div');
            card.className = 'animal-card';

            // Eläimen kuva
            const image = document.createElement('img');

            // Määritellään kuva niille eläimille,
            // joilla ei ole kuvaosoitetta tietokannassa
            const animalImages = {
                'Nöpö': 'nopo.jpg',
                'Viiru': 'viiru.jpg',
                'Musti': 'musti.jpg'
            };

            // Käytetään tietokannan kuvaosoitetta,
            // tai eläimen nimen perusteella määriteltyä kuvaa
            image.src = animal.image_url ||
                `/images/${animalImages[animal.name] || 'placeholder.jpg'}`;

            image.alt = animal.name;

            // Jos kuvaa ei löydy, näytetään varakuva
            image.onerror = () => {
                image.onerror = null;
                image.src = '/images/placeholder.jpg';
            };

            // Eläimen tiedot
            const info = document.createElement('div');
            info.className = 'animal-info';

            // Eläimen nimi
            const name = document.createElement('h3');
            name.textContent = animal.name;

            // Eläimen tyyppi
            const type = document.createElement('p');
            type.textContent = `Eläin: ${animal.type}`;

            // Eläimen ikä
            const age = document.createElement('p');
            age.textContent = `Ikä: ${animal.age} vuotta`;

            // Eläimen adoptiostatus
            const status = document.createElement('p');

            if (animal.status === 'available') {
                status.textContent = 'Adoptoitavissa';
                status.style.color = '#315c42';
            } else {
                status.textContent = 'Ei adoptoitavissa';
                status.style.color = '#b42318';
            }

            // Katso lisää -painike
            const button = document.createElement('a');
            button.href = `animal.html?id=${encodeURIComponent(animal.id)}`;
            button.className = 'btn';
            button.textContent = 'Katso lisää';

            // Lisätään tiedot korttiin
            info.append(name, type, age, status, button);

            // Lisätään kuva ja tiedot korttiin
            card.append(image, info);

            // Lisätään kortti sivulle
            animalList.appendChild(card);
        });

    } catch (error) {
        console.error('Virhe eläinten hakemisessa:', error);

        animalList.textContent =
            'Eläinten lataaminen epäonnistui. Yritä myöhemmin uudelleen.';
    }
}

// Käynnistetään eläinten haku, kun sivu on ladattu
document.addEventListener('DOMContentLoaded', haeElaimet);