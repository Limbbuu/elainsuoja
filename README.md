# elainsuoja
VAMK web-palveluiden toteutus projektityö

# ryhmä
Linus Nurminen
Aapo Viherlehto
Ari Junger
Samuel Jääskeläinen

# projektin kuvaus
Luoda ns fullstack helpookäyttöinen digitaalinen ratkaisu asiakkaalle eläinten adoptihakemusten helpottamiseksi. Toteutetaan moderni web-sovellus, joka helpottaa adoptointia. Aiemmin adoptoijat ovat joutuneet vierailemaan paikan päälle ja soittamaan jne tutustuakseen eläimiin.

Toteutuksemme avulla tarjoamme adoptoijille mahdollisuuden tutustua eläimiin verkossa, lukea yksityiskohtaiset tiedot kustakin eläimestä, jättää adoptiohakemuksen sähköisesti sekä saada välittömän vahvistuksen tehdystä hakemuksesta.

# vaatimukset
Docker Desktop
Git

# käynnistys
git clone https://github.com/Limbbuu/elainsuoja
cd elainsuoja
docker-compose up --build
avaa http://localhost:8080

# datan nollaus
docker-compose down -v poistaa tietokannan, ja seuraava käynnistys luo sen uudelleen esimerkkidatalla.

# arkkitehtuuri
| Palvelu | Teknologia | Portti | Tehtävä |
| --- | --- | --- | --- |
| frontend | nginx, HTML/CSS/JS | 8080 | Käyttöliittymä, välittää `/api/*`-kutsut Server A:lle |
| server-a | Node.js 20, Express | 3001 | Eläintiedot ja API Gateway |
| server-b | Node.js 20, Express | 3002 | Adoptiohakemusten tallennus |
| db | PostgreSQL 16 | – | Tietokanta |

Frontend puhuu vain Server A:lle. Adoptiohakemuksen kulku:

1. Frontend lähettää hakemuksen Server A:lle (`POST /animals/:id/adopt`)
2. Server A välittää sen Server B:lle (`POST /adoptions`)
3. Server B tallentaa hakemuksen ja merkitsee eläimen adoptoiduksi
4. Server B palauttaa vahvistuksen Server A:lle
5. Server A palauttaa vastauksen frontendille

# tietokannan rakenne

**animals**

| Sarake | Tyyppi | Kuvaus |
| --- | --- | --- |
| id | SERIAL | Pääavain |
| name | VARCHAR(100) | Nimi |
| type | VARCHAR(20) | `kissa` tai `koira` |
| age | INTEGER | Ikä vuosina |
| breed | VARCHAR(100) | Rotu |
| description | TEXT | Kuvaus |
| image_url | TEXT | Kuvan osoite, voi olla tyhjä |
| status | VARCHAR(20) | `available` tai `adopted` |

**adoptions**

| Sarake | Tyyppi | Kuvaus |
| --- | --- | --- |
| id | SERIAL | Pääavain |
| animal_id | INTEGER | Viittaa `animals.id`, UNIQUE |
| applicant_name | VARCHAR(100) | Hakijan nimi |
| email | VARCHAR(200) | Sähköposti |
| phone | VARCHAR(50) | Puhelin (valinnainen) |
| message | TEXT | Viesti (valinnainen) |
| created_at | TIMESTAMP | Hakemuksen aika |

`animal_id`:n UNIQUE-rajoite estää saman eläimen adoptoinnin kahdesti myös tietokantatasolla.

## API: Server A (portti 3001)

| Metodi | Polku | Kuvaus | Vastaukset |
| --- | --- | --- | --- |
| GET | `/health` | Palvelun tila | 200 |
| GET | `/animals` | Kaikki eläimet | 200, 500 |
| GET | `/animals/:id` | Yhden eläimen kaikki tiedot | 200, 400, 404, 500 |
| POST | `/animals/:id/adopt` | Adoptiohakemus, välitetään Server B:lle | 201, 400, 404, 409, 502 |

**Esimerkki: GET /animals/1**

```json
{
  "id": 1,
  "name": "Miuku",
  "type": "kissa",
  "age": 2,
  "breed": "Maatiainen",
  "description": "Leikkisä ja utelias kissa, joka rakastaa kiipeilyä.",
  "image_url": "/images/miuku.jpg",
  "status": "available"
}
```

**Esimerkki: POST /animals/1/adopt**

Pyynnön runko (`applicant_name` ja `email` pakollisia):

```json
{
  "applicant_name": "Matti Meikäläinen",
  "email": "matti@example.com",
  "phone": "040 123 4567",
  "message": "Minulla on iso piha."
}
```

| Tilanne | Status | Vastaus |
| --- | --- | --- |
| Onnistui | 201 | Server B:n vahvistus |
| Nimi tai sähköposti puuttuu | 400 | `{ "error": "Nimi ja sähköposti ovat pakollisia" }` |
| Virheellinen id | 400 | `{ "error": "Virheellinen id" }` |
| Eläintä ei ole | 404 | `{ "error": "Eläintä ei löytynyt" }` |
| Eläin on jo adoptoitu | 409 | `{ "error": "Eläin on jo adoptoitu" }` |
| Server B ei vastaa | 502 | `{ "error": "Adoptiopalvelu ei vastaa" }` |

Testaus komentoriviltä (Windowsissa `curl.exe`):

```
curl.exe http://localhost:3001/animals
curl.exe -X POST http://localhost:3001/animals/1/adopt -H "Content-Type: application/json" -d "{\"applicant_name\":\"Testi\",\"email\":\"testi@example.com\"}"
```

## API: Server B (portti 3002)

_Täydennetään, kun Server B valmistuu._

## Käyttöliittymä

_Täydennetään, kun frontend valmistuu._