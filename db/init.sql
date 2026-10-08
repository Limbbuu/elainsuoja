CREATE TABLE animals (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  type        VARCHAR(20)  NOT NULL CHECK (type IN ('kissa', 'koira')),
  age         INTEGER      NOT NULL CHECK (age >= 0),
  breed       VARCHAR(100),
  description TEXT,
  image_url   TEXT,
  status      VARCHAR(20)  NOT NULL DEFAULT 'available'
              CHECK (status IN ('available', 'adopted'))
);


CREATE TABLE adoptions (
  id             SERIAL PRIMARY KEY,
  animal_id      INTEGER NOT NULL UNIQUE REFERENCES animals(id),
  applicant_name VARCHAR(100) NOT NULL,
  email          VARCHAR(200) NOT NULL,
  phone          VARCHAR(50),
  message        TEXT,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);


INSERT INTO animals (name, type, age, breed, description, image_url) VALUES
('Miuku',  'kissa', 2, 'Maatiainen',       'Leikkisä ja utelias kissa, joka rakastaa kiipeilyä.', '/images/miuku.jpg'),
('Rekku',  'koira', 5, 'Saksanpaimenkoira', 'Rauhallinen ja uskollinen, sopii aktiiviselle perheelle.', '/images/rekku.jpg'),
('Nöpö',   'kissa', 8, 'Persialainen',     'Seniorikissa, joka nauttii sylissä olosta.', NULL),
('Haukku', 'koira', 1, 'Labradorinnoutaja', 'Energinen pentu, joka tarvitsee paljon liikuntaa.', '/images/haukku.jpg'),
('Viiru',  'kissa', 4, 'Norjalainen metsäkissa', 'Itsenäinen mutta ystävällinen.', NULL),
('Musti',  'koira', 10, 'Sekarotuinen',    'Lempeä vanhus, joka kaipaa rauhallista kotia.', NULL);
