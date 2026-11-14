// Haetaan eläimen ID osoitteesta, esim. animal.html?id=2
const params = new URLSearchParams(window.location.search);
const animalId = params.get('id');

const animalDetails = document.getElementById('animal-details');
const adoptionSection = document.getElementById('adoption-section');
const adoptionForm = document.getElementById('adoption-form');
const formError = document.getElementById('form-error');
const submitButton = document.getElementById('submit-btn');

// Haetaan eläimen tiedot Server A:lta
async function haeElain() {
    if (!animalId || !/^\d+$/.test(animalId)) {
        animalDetails.textContent = 'Virheellinen eläimen ID.';
        return;
    }

    try {
        const response = await fetch(`/animals/${animalId}`);

        if (!response.ok) {
            throw new Error('Eläimen tietojen hakeminen epäonnistui.');
        }

        const animal = await response.json();

        // Tyhjennetään latausteksti
        animalDetails.innerHTML = '';

        // Eläimen kuva
        const image = document.createElement('img');
        image.src = animal.image_url || 'public/images/placeholder.jpg';
        image.alt = animal.name;

        image.onerror = () => {
            image.onerror = null;
            image.src = 'public/images/placeholder.jpg';
        };

        // Eläimen tiedot
        const info = document.createElement('div');
        info.className = 'animal-detail-info';

        const name = document.createElement('h1');
        name.textContent = animal.name;

        const type = document.createElement('p');
        type.textContent = `Eläin: ${animal.type}`;

        const age = document.createElement('p');
        age.textContent = `Ikä: ${animal.age} vuotta`;

        const breed = document.createElement('p');
        breed.textContent = `Rotu: ${animal.breed || 'Ei tiedossa'}`;

        const description = document.createElement('p');
        description.textContent = animal.description || 'Ei kuvausta.';

        const status = document.createElement('p');
        status.textContent = `Tila: ${animal.status}`;

        info.append(name, type, age, breed, description, status);
        animalDetails.append(image, info);

        // Näytetään hakemus vain, jos eläin on adoptoitavissa
        if (animal.status === 'available') {
            adoptionSection.hidden = false;
        } else {
            adoptionSection.hidden = true;
        }

    } catch (error) {
        console.error(error);
        animalDetails.textContent =
            'Eläimen tietojen lataaminen epäonnistui.';
    }
}

// Lähetetään adoptiohakemus
adoptionForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    formError.hidden = true;
    submitButton.disabled = true;
    submitButton.textContent = 'Lähetetään...';

    const formData = new FormData(adoptionForm);

    const application = {
        applicant_name: formData.get('applicant_name').trim(),
        email: formData.get('email').trim(),
        phone: formData.get('phone').trim(),
        message: formData.get('message').trim()
    };

    try {
        const response = await fetch(`/animals/${animalId}/adopt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(application)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Hakemuksen lähetys epäonnistui.');
        }

        // Siirrytään kiitos-sivulle onnistuneen tallennuksen jälkeen
        window.location.href =
            `thank-you.html?animal=${encodeURIComponent(animalId)}`;

    } catch (error) {
        formError.textContent = error.message;
        formError.hidden = false;
        submitButton.disabled = false;
        submitButton.textContent = 'Adoptoi minut';
    }
});

// Käynnistetään eläimen tietojen haku
haeElain();