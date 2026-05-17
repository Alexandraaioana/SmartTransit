/* ============================================================ */
/*        SmartTransit - Baza de Date Completa                  */
/* ============================================================ */


/* ============================================================ */
/* PARTEA 1 - STERGEREA SI RECREAREA BAZEI DE DATE              */
/* Pentru baza de date din CLOUD (Aiven), ruleaza direct        */
/* ============================================================ */

DROP DATABASE IF EXISTS taxidb;
CREATE DATABASE taxidb
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_romanian_ci;
USE taxidb;


/* ============================================================ */
/* PARTEA 2 - CREAREA TABELELOR                                 */
/* ============================================================ */

CREATE TABLE administrativ (
                               cnp_angajat    VARCHAR(45)  PRIMARY KEY,
                               nume_prenume   VARCHAR(100) NOT NULL,
                               functie        VARCHAR(45),
                               email          VARCHAR(100),
                               nr_tel         VARCHAR(45),
                               salariu        FLOAT,
                               data_angajare  DATETIME,
                               bonusuri       VARCHAR(45)
);

CREATE TABLE tranzactii (
                            id_tranzactie              INT AUTO_INCREMENT PRIMARY KEY,
                            tip                        VARCHAR(45),
                            suma                       FLOAT NOT NULL,
                            data                       DATETIME,
                            descriere                  MEDIUMTEXT,
                            administrativ_cnp_angajat  VARCHAR(45),
                            FOREIGN KEY (administrativ_cnp_angajat) REFERENCES administrativ(cnp_angajat)
);

CREATE TABLE sofer (
                       id_sofer  INT AUTO_INCREMENT PRIMARY KEY,
                       nume      VARCHAR(100) NOT NULL,
                       telefon   VARCHAR(20),
                       mail      VARCHAR(100) UNIQUE,
                       parola    VARCHAR(45),
                       status    VARCHAR(45)  DEFAULT 'offline',
                       cnp       VARCHAR(15),
                       activ     BIT(1)       DEFAULT 1
);

CREATE TABLE masina (
                        sofer_id_sofer   INT         PRIMARY KEY,
                        nr_inmatriculare VARCHAR(45) NOT NULL,
                        model            VARCHAR(45),
                        categorie        VARCHAR(45),
                        km_parcursi      INT         DEFAULT 0,
                        culoare          VARCHAR(45),
                        an_fabricare     INT,
                        FOREIGN KEY (sofer_id_sofer) REFERENCES sofer(id_sofer) ON DELETE CASCADE
);

CREATE TABLE client (
                        id_client    INT AUTO_INCREMENT PRIMARY KEY,
                        nume         VARCHAR(100) NOT NULL,
                        nr_tel       VARCHAR(20),
                        mail         VARCHAR(100) UNIQUE,
                        parola       VARCHAR(45),
                        km_parcursi  INT          DEFAULT 0,
                        adresa       VARCHAR(100),
                        metoda_plata VARCHAR(45)  DEFAULT 'Cash',
                        activ        BIT(1)       DEFAULT 1
);

CREATE TABLE discount (
                          id_discount    INT AUTO_INCREMENT PRIMARY KEY,
                          cod_discount   VARCHAR(45) UNIQUE,
                          valoare        FLOAT,
                          data_expirare  DATETIME,
                          tip_valoare    VARCHAR(45)  -- 'procent' sau 'fix'
);

CREATE TABLE client_has_discount (
                                     client_id_client      INT,
                                     discount_id_discount  INT,
                                     PRIMARY KEY (client_id_client, discount_id_discount),
                                     FOREIGN KEY (client_id_client)     REFERENCES client(id_client)   ON DELETE CASCADE,
                                     FOREIGN KEY (discount_id_discount) REFERENCES discount(id_discount) ON DELETE CASCADE
);

CREATE TABLE cursa (
                       id_cursa         INT AUTO_INCREMENT PRIMARY KEY,
                       client_id_client INT,
                       sofer_id_sofer   INT,
                       status           VARCHAR(45),
                       plecare          VARCHAR(255),
                       destinatie       VARCHAR(255),
                       data_comanda     DATE,
                       ora_comanda      TIME,
                       ora_start        TIME,
                       ora_destinatie   TIME,
                       pret_estimat     FLOAT,
                       pret_final       FLOAT,
                       distanta         FLOAT,
                       categorie        VARCHAR(45),
                       tips             FLOAT DEFAULT 0,
                       cod_discount     VARCHAR(45),
                       FOREIGN KEY (client_id_client) REFERENCES client(id_client),
                       FOREIGN KEY (sofer_id_sofer)   REFERENCES sofer(id_sofer)
);

CREATE TABLE plata (
                       cursa_id_cursa           INT PRIMARY KEY,
                       metoda_plata             VARCHAR(45),
                       data_ora                 DATETIME,
                       status                   TINYINT,
                       suma                     FLOAT,
                       tips                     FLOAT,
                       tranzactii_id_tranzactie INT,
                       FOREIGN KEY (cursa_id_cursa)           REFERENCES cursa(id_cursa),
                       FOREIGN KEY (tranzactii_id_tranzactie) REFERENCES tranzactii(id_tranzactie)
);

CREATE TABLE card (
                      idcard               INT AUTO_INCREMENT PRIMARY KEY,
                      client_id_client     INT,
                      plata_cursa_id_cursa INT,
                      FOREIGN KEY (client_id_client)     REFERENCES client(id_client),
                      FOREIGN KEY (plata_cursa_id_cursa) REFERENCES plata(cursa_id_cursa)
);

CREATE TABLE recenzie (
                          id_recenzie      INT AUTO_INCREMENT PRIMARY KEY,
                          sofer_id_sofer   INT,
                          client_id_client INT,
                          rating           INT,
                          comentarii       LONGTEXT,
                          tip_autor        VARCHAR(45),   -- 'client' sau 'sofer'
                          FOREIGN KEY (sofer_id_sofer)   REFERENCES sofer(id_sofer),
                          FOREIGN KEY (client_id_client) REFERENCES client(id_client)
);

CREATE TABLE certificat (
                            id_certificat   INT AUTO_INCREMENT PRIMARY KEY,
                            sofer_id_sofer  INT,
                            certificat_tip  VARCHAR(45),
                            certificat_poza MEDIUMBLOB,
                            data_exp_certif DATE,
                            FOREIGN KEY (sofer_id_sofer) REFERENCES sofer(id_sofer) ON DELETE CASCADE
);


/* ============================================================ */
/* PARTEA 3 - CONTURI DE TEST (login rapid in aplicatie)        */
/* ============================================================ */

-- Sofer de test: mail = sofer@site.test | parola = sofer
INSERT INTO sofer (id_sofer, nume, telefon, mail, parola, status, cnp, activ) VALUES
    (99, 'Sofer Test', '0744123123', 'sofer@site.test', 'sofer', 'offline', '1850202112233', 1);

-- Masina pentru soferul de test
INSERT INTO masina (sofer_id_sofer, nr_inmatriculare, model, categorie, km_parcursi, culoare, an_fabricare) VALUES
    (99, 'B 99 TST', 'Skoda Octavia', 'standard', 45000, 'Negru', 2021);

-- Client de test: mail = client@site.test | parola = client
INSERT INTO client (id_client, nume, nr_tel, mail, parola, km_parcursi, adresa, metoda_plata, activ) VALUES
    (99, 'Client Test', '0722000111', 'client@site.test', 'client', 120, 'Strada Principala 1, Bucuresti', 'Card', 1);


/* ============================================================ */
/* PARTEA 4 - DATE REALISTE (Auto-populare)                     */
/* ============================================================ */

-- ------------------------------------------------------------ --
-- 4.1 SOFERI
-- ------------------------------------------------------------ --
INSERT INTO sofer (nume, telefon, mail, parola, status, cnp, activ) VALUES
                                                                        ('Alexandru Ionescu',  '0721100001', 'a.ionescu@smarttransit.ro',  'sofer123', 'offline', '1900315123456', 1),
                                                                        ('Mihai Popescu',      '0721100002', 'm.popescu@smarttransit.ro',  'sofer123', 'offline', '1880712234567', 1),
                                                                        ('Gheorghe Dumitrescu','0721100003', 'g.dumitrescu@smarttransit.ro','sofer123', 'offline', '1950430345678', 1),
                                                                        ('Ion Constantin',     '0721100004', 'i.constantin@smarttransit.ro','sofer123', 'offline', '1870601456789', 1),
                                                                        ('Vasile Marin',       '0721100005', 'v.marin@smarttransit.ro',    'sofer123', 'offline', '1910920567890', 1),
                                                                        ('Florin Popa',        '0721100006', 'f.popa@smarttransit.ro',     'sofer123', 'offline', '1930215678901', 1),
                                                                        ('Cristian Stancu',    '0721100007', 'c.stancu@smarttransit.ro',   'sofer123', 'offline', '1760408789012', 1),
                                                                        ('Bogdan Radu',        '0721100008', 'b.radu@smarttransit.ro',     'sofer123', 'offline', '1840522890123', 1),
                                                                        ('Daniel Stoica',      '0721100009', 'd.stoica@smarttransit.ro',   'sofer123', 'offline', '1990110901234', 1),
                                                                        ('Andrei Luca',        '0721100010', 'a.luca@smarttransit.ro',     'sofer123', 'offline', '1961225012345', 1),
                                                                        ('Marian Nica',        '0721100011', 'm.nica@smarttransit.ro',     'sofer123', 'offline', '1970730123456', 1),
                                                                        ('Stefan Grigorescu',  '0721100012', 's.grigorescu@smarttransit.ro','sofer123','offline', '1980415234567', 1),
                                                                        ('Tudor Moldovan',     '0721100013', 't.moldovan@smarttransit.ro', 'sofer123', 'offline', '1750908345678', 0),
                                                                        ('Relu Draghici',      '0721100014', 'r.draghici@smarttransit.ro', 'sofer123', 'offline', '1820314456789', 0),
                                                                        ('Costel Badea',       '0721100015', 'c.badea@smarttransit.ro',    'sofer123', 'offline', '1910712567890', 1);

-- ------------------------------------------------------------ --
-- 4.2 MASINI (pentru soferii 1-12; soferii 13-15 fara masina)  --
-- ------------------------------------------------------------ --
INSERT INTO masina (sofer_id_sofer, nr_inmatriculare, model, categorie, km_parcursi, culoare, an_fabricare) VALUES
                                                                                                                (1,  'B 12 ABC', 'Dacia Logan',      'economy',  85000,  'Alb',      2019),
                                                                                                                (2,  'B 34 DEF', 'Renault Clio',     'economy',  112000, 'Argintiu', 2018),
                                                                                                                (3,  'B 56 GHI', 'Skoda Octavia',    'standard', 67000,  'Negru',    2021),
                                                                                                                (4,  'B 78 JKL', 'Toyota Corolla',   'standard', 93000,  'Alb',      2020),
                                                                                                                (5,  'B 90 MNO', 'VW Passat',        'standard', 145000, 'Gri',      2017),
                                                                                                                (6,  'B 11 PQR', 'Mercedes C-Class', 'premium',  54000,  'Negru',    2022),
                                                                                                                (7,  'B 22 STU', 'BMW Seria 5',      'premium',  78000,  'Albastru', 2021),
                                                                                                                (8,  'B 33 VWX', 'Audi A6',          'premium',  61000,  'Argintiu', 2022),
                                                                                                                (9,  'B 44 YZA', 'Dacia Duster',     'xl',       44000,  'Portocaliu',2023),
                                                                                                                (10, 'B 55 BCD', 'Ford Galaxy',      'xl',       99000,  'Alb',      2019),
                                                                                                                (11, 'B 66 EFG', 'VW Touareg',       'xl',       72000,  'Negru',    2020),
                                                                                                                (12, 'B 77 HIJ', 'Hyundai i20',      'economy',  38000,  'Rosu',     2023);

-- ------------------------------------------------------------ --
-- 4.3 CLIENTI                                                  --
-- ------------------------------------------------------------ --
INSERT INTO client (nume, nr_tel, mail, parola, km_parcursi, adresa, metoda_plata, activ) VALUES
                                                                                              ('Maria Ionescu',     '0731200001', 'm.ionescu@gmail.com',     'client123', 340,  'Str. Mihai Viteazu 5, Bucuresti',      'Card',      1),
                                                                                              ('Elena Popescu',     '0731200002', 'e.popescu@gmail.com',     'client123', 210,  'Bd. Unirii 12, Bucuresti',             'Cash',      1),
                                                                                              ('Ioana Constantin',  '0731200003', 'i.constantin@gmail.com',  'client123', 875,  'Str. Florilor 3, Cluj-Napoca',         'Apple Pay', 1),
                                                                                              ('Ana Dumitrescu',    '0731200004', 'a.dumitrescu@yahoo.com',  'client123', 120,  'Calea Victoriei 88, Bucuresti',        'Card',      1),
                                                                                              ('Cristina Marin',    '0731200005', 'c.marin@gmail.com',       'client123', 560,  'Str. Libertatii 22, Timisoara',        'Cash',      1),
                                                                                              ('Laura Popa',        '0731200006', 'l.popa@gmail.com',        'client123', 95,   'Str. Eminescu 7, Iasi',                'Card',      1),
                                                                                              ('Andreea Stancu',    '0731200007', 'a.stancu@gmail.com',      'client123', 430,  'Bd. Magheru 45, Bucuresti',            'Apple Pay', 1),
                                                                                              ('Raluca Radu',       '0731200008', 'r.radu@yahoo.com',        'client123', 280,  'Str. Republicii 15, Brasov',           'Cash',      1),
                                                                                              ('Gabriela Stoica',   '0731200009', 'g.stoica@gmail.com',      'client123', 640,  'Str. Andrei Muresanu 9, Cluj-Napoca',  'Card',      1),
                                                                                              ('Mihaela Luca',      '0731200010', 'm.luca@gmail.com',        'client123', 185,  'Bd. Dacia 33, Bucuresti',              'Cash',      1),
                                                                                              ('Sorin Badea',       '0731200011', 's.badea@gmail.com',       'client123', 720,  'Str. Dorobanti 61, Bucuresti',         'Card',      1),
                                                                                              ('Razvan Niculae',    '0731200012', 'r.niculae@gmail.com',     'client123', 310,  'Str. Libertatii 5, Craiova',           'Cash',      1),
                                                                                              ('Catalin Voicu',     '0731200013', 'c.voicu@yahoo.com',       'client123', 455,  'Str. Stefan cel Mare 18, Iasi',        'Card',      1),
                                                                                              ('Ionut Petrescu',    '0731200014', 'i.petrescu@gmail.com',    'client123', 88,   'Str. Independentei 27, Ploiesti',      'Apple Pay', 0),
                                                                                              ('Adrian Florescu',   '0731200015', 'a.florescu@gmail.com',    'client123', 920,  'Bd. Bucurestii Noi 14, Bucuresti',     'Cash',      1);

-- ------------------------------------------------------------ --
-- 4.4 DISCOUNTURI                                              --
-- ------------------------------------------------------------ --
INSERT INTO discount (cod_discount, valoare, data_expirare, tip_valoare) VALUES
                                                                             ('WELCOME10',  10, DATE_ADD(NOW(), INTERVAL 6 MONTH),  'procent'),
                                                                             ('SUMMER20',   20, DATE_ADD(NOW(), INTERVAL 3 MONTH),  'procent'),
                                                                             ('FIX15',      15, DATE_ADD(NOW(), INTERVAL 1 MONTH),  'fix'),
                                                                             ('VIP30',      30, DATE_ADD(NOW(), INTERVAL 1 YEAR),   'procent'),
                                                                             ('EXPIRAT5',    5, DATE_SUB(NOW(), INTERVAL 10 DAY),   'procent');  -- expirat intentionat

-- Alocam discount-uri la clienti
INSERT INTO client_has_discount (client_id_client, discount_id_discount) VALUES
                                                                             (1, 1), (1, 2),
                                                                             (3, 2), (3, 4),
                                                                             (5, 1),
                                                                             (7, 3),
                                                                             (9, 4),
                                                                             (11,1), (11,2), (11,4),
                                                                             (99,1);

-- ------------------------------------------------------------ --
-- 4.5 CURSE FINALIZATE (cu plata si recenzii)                  --
-- ------------------------------------------------------------ --

-- Helper: inseram curse cu status 'Ride Finished'
INSERT INTO cursa (client_id_client, sofer_id_sofer, status, plecare, destinatie,
                   data_comanda, ora_comanda, ora_start, ora_destinatie,
                   pret_estimat, pret_final, distanta, categorie, tips, cod_discount) VALUES
-- Cursa 1
(1,  1,  'Finalizat', 'Piata Unirii, Bucuresti',         'Aeroportul Otopeni',          DATE_SUB(CURDATE(),INTERVAL 25 DAY), '08:10:00','08:12:00','08:57:00', 58.80, 61.00, 24.5, 'economy',  5.00, NULL),
-- Cursa 2
(2,  3,  'Finalizat', 'Gara de Nord, Bucuresti',         'Piata Victoriei',             DATE_SUB(CURDATE(),INTERVAL 23 DAY), '09:30:00','09:32:00','09:48:00', 14.50, 13.00,  5.0, 'standard', 0.00, NULL),
-- Cursa 3
(3,  6,  'Finalizat', 'Str. Florilor 3, Cluj-Napoca',    'Aeroportul Cluj',             DATE_SUB(CURDATE(),INTERVAL 22 DAY), '06:00:00','06:02:00','06:28:00', 37.10, 39.00, 12.5, 'premium',  10.00,'WELCOME10'),
-- Cursa 4
(4,  4,  'Finalizat', 'Calea Victoriei 88, Bucuresti',   'Parcul Herastrau',            DATE_SUB(CURDATE(),INTERVAL 20 DAY), '14:15:00','14:17:00','14:35:00', 13.92, 15.00,  4.8, 'standard', 2.00, NULL),
-- Cursa 5
(5,  2,  'Finalizat', 'Bd. Revolutiei, Timisoara',       'Aeroportul Traian Vuia',      DATE_SUB(CURDATE(),INTERVAL 19 DAY), '11:00:00','11:01:00','11:22:00', 24.07, 26.00,  8.3, 'economy',  0.00, NULL),
-- Cursa 6
(6,  7,  'Finalizat', 'Piata Palatului, Iasi',           'Gara Iasi',                   DATE_SUB(CURDATE(),INTERVAL 18 DAY), '16:40:00','16:42:00','16:55:00', 11.60, 10.00,  4.0, 'premium',  5.00, NULL),
-- Cursa 7
(7,  9,  'Finalizat', 'Bd. Magheru 45, Bucuresti',       'IKEA Pallady',                DATE_SUB(CURDATE(),INTERVAL 17 DAY), '13:00:00','13:03:00','13:38:00', 40.50, 38.00, 13.9, 'xl',       3.00, 'SUMMER20'),
-- Cursa 8
(8,  5,  'Finalizat', 'Str. Republicii 15, Brasov',      'Poiana Brasov',               DATE_SUB(CURDATE(),INTERVAL 16 DAY), '10:20:00','10:22:00','10:45:00', 30.16, 32.00, 10.4, 'standard', 0.00, NULL),
-- Cursa 9
(9,  8,  'Finalizat', 'Str. Andrei Muresanu 9, Cluj',    'Centrul Vechi Cluj',          DATE_SUB(CURDATE(),INTERVAL 15 DAY), '19:30:00','19:31:00','19:44:00',  9.28,  8.00,  3.2, 'premium',  2.00, NULL),
-- Cursa 10
(10, 1,  'Finalizat', 'Bd. Dacia 33, Bucuresti',         'Spitalul Floreasca',          DATE_SUB(CURDATE(),INTERVAL 14 DAY), '07:00:00','07:01:00','07:18:00', 15.66, 17.00,  5.4, 'economy',  0.00, NULL),
-- Cursa 11
(11, 10, 'Finalizat', 'Str. Dorobanti 61, Bucuresti',    'Baneasa Shopping City',       DATE_SUB(CURDATE(),INTERVAL 13 DAY), '15:10:00','15:12:00','15:29:00', 23.49, 25.00,  8.1, 'xl',       5.00, 'VIP30'),
-- Cursa 12
(12, 3,  'Finalizat', 'Str. Libertatii 5, Craiova',      'Parcul Nicolae Romanescu',    DATE_SUB(CURDATE(),INTERVAL 12 DAY), '12:00:00','12:02:00','12:14:00', 13.34, 12.00,  4.6, 'standard', 0.00, NULL),
-- Cursa 13
(13, 6,  'Finalizat', 'Str. Stefan cel Mare 18, Iasi',   'Parcul Copou',                DATE_SUB(CURDATE(),INTERVAL 11 DAY), '17:45:00','17:46:00','17:58:00', 11.02, 13.00,  3.8, 'premium',  0.00, NULL),
-- Cursa 14
(1,  11, 'Finalizat', 'Piata Unirii, Bucuresti',         'Mall Vitan',                  DATE_SUB(CURDATE(),INTERVAL 10 DAY), '11:30:00','11:32:00','11:55:00', 29.61, 28.00, 10.2, 'xl',       7.00, NULL),
-- Cursa 15
(3,  4,  'Finalizat', 'Aeroportul Cluj',                 'Str. Florilor 3, Cluj-Napoca',DATE_SUB(CURDATE(),INTERVAL 9  DAY), '20:10:00','20:12:00','20:38:00', 36.25, 34.00, 12.5, 'standard', 0.00, 'FIX15'),
-- Cursa 16
(5,  7,  'Finalizat', 'Centrul Timisoara',               'Fabrica de Bere Timisoreana', DATE_SUB(CURDATE(),INTERVAL 8  DAY), '21:00:00','21:01:00','21:12:00', 11.89, 14.00,  4.1, 'premium',  5.00, NULL),
-- Cursa 17
(2,  2,  'Finalizat', 'Piata Victoriei, Bucuresti',      'Scoala Centrala',             DATE_SUB(CURDATE(),INTERVAL 7  DAY), '07:45:00','07:46:00','07:59:00',  8.41,  9.00,  2.9, 'economy',  0.00, NULL),
-- Cursa 18
(9,  12, 'Finalizat', 'Centrul Vechi Cluj',              'Parcul Babes',                DATE_SUB(CURDATE(),INTERVAL 6  DAY), '18:20:00','18:21:00','18:31:00',  8.70,  7.00,  3.0, 'economy',  1.00, NULL),
-- Cursa 19
(11, 6,  'Finalizat', 'Bd. Bucurestii Noi 14, Bucuresti','Piata Presei Libere',         DATE_SUB(CURDATE(),INTERVAL 5  DAY), '09:00:00','09:01:00','09:11:00', 11.90, 13.00,  4.1, 'premium',  3.00, 'VIP30'),
-- Cursa 20
(4,  8,  'Finalizat', 'Calea Victoriei 88, Bucuresti',   'Cimitirul Bellu',             DATE_SUB(CURDATE(),INTERVAL 4  DAY), '14:00:00','14:02:00','14:19:00', 17.50, 19.00,  6.0, 'premium',  0.00, NULL),
-- Cursa 21
(6,  1,  'Finalizat', 'Piata Palatului, Iasi',           'Manastirea Trei Ierarhi',     DATE_SUB(CURDATE(),INTERVAL 3  DAY), '10:10:00','10:11:00','10:21:00', 10.15, 11.00,  3.5, 'economy',  2.00, NULL),
-- Cursa 22
(7,  5,  'Finalizat', 'Bd. Magheru 45, Bucuresti',       'Piata Charles de Gaulle',     DATE_SUB(CURDATE(),INTERVAL 2  DAY), '16:00:00','16:01:00','16:09:00',  8.12,  7.00,  2.8, 'standard', 0.00, NULL),
-- Cursa 23
(99, 99, 'Finalizat', 'Str. Principala 1, Bucuresti',    'Piata Universitatii',         DATE_SUB(CURDATE(),INTERVAL 1  DAY), '12:00:00','12:01:00','12:18:00', 20.30, 22.00,  7.0, 'standard', 5.00, 'WELCOME10');

-- ------------------------------------------------------------ --
-- 4.6 CURSE ACTIVE SI ANULATE                                  --
-- ------------------------------------------------------------ --
INSERT INTO cursa (client_id_client, sofer_id_sofer, status, plecare, destinatie,
                   data_comanda, ora_comanda, pret_estimat, distanta, categorie) VALUES
-- In asteptare sofer
(8,  NULL, 'In asteptare', 'Str. Republicii 15, Brasov', 'Centrul Brasov',          CURDATE(), '10:00:00', 12.18, 4.2, 'standard'),
(13, NULL, 'In asteptare', 'Str. Stefan cel Mare 18, Iasi','Teatrul National Iasi', CURDATE(), '11:30:00',  8.41, 2.9, 'economy'),
-- In cursa
(10, 3,   'In cursa',        'Bd. Dacia 33, Bucuresti',    'Aeroportul Otopeni',       CURDATE(), '09:00:00', 56.55,23.5, 'economy'),
-- Anulate
(14, NULL, 'Anulat',      'Str. Independentei 27, Ploiesti','Mall Ploiesti Sud',    DATE_SUB(CURDATE(),INTERVAL 5 DAY),'15:00:00', 14.50, 5.0, 'standard'),
(12, NULL, 'Anular',      'Str. Libertatii 5, Craiova', 'Spitalul Judetean',        DATE_SUB(CURDATE(),INTERVAL 3 DAY),'08:20:00',  9.57, 3.3, 'economy');

-- ------------------------------------------------------------ --
-- 4.7 PLATI (pentru cursele finalizate)                        --
-- Notă: suma = pretul platit efectiv de client (cu discount)   --
-- ------------------------------------------------------------ --
INSERT INTO plata (cursa_id_cursa, metoda_plata, data_ora, status, suma, tips) VALUES
                                                                                   ( 1, 'Card',      DATE_SUB(NOW(),INTERVAL 25 DAY), 1,  61.00, 5.00),
                                                                                   ( 2, 'Cash',      DATE_SUB(NOW(),INTERVAL 23 DAY), 1,  13.00, 0.00),
                                                                                   ( 3, 'Cash',      DATE_SUB(NOW(),INTERVAL 22 DAY), 1,  35.10,10.00),  -- 39 - 10% = 35.1
                                                                                   ( 4, 'Card',      DATE_SUB(NOW(),INTERVAL 20 DAY), 1,  15.00, 2.00),
                                                                                   ( 5, 'Cash',      DATE_SUB(NOW(),INTERVAL 19 DAY), 1,  26.00, 0.00),
                                                                                   ( 6, 'Card',      DATE_SUB(NOW(),INTERVAL 18 DAY), 1,  10.00, 5.00),
                                                                                   ( 7, 'Card',      DATE_SUB(NOW(),INTERVAL 17 DAY), 1,  30.40, 3.00),  -- 38 - 20% = 30.4
                                                                                   ( 8, 'Cash',      DATE_SUB(NOW(),INTERVAL 16 DAY), 1,  32.00, 0.00),
                                                                                   ( 9, 'Card',      DATE_SUB(NOW(),INTERVAL 15 DAY), 1,   8.00, 2.00),
                                                                                   (10, 'Cash',      DATE_SUB(NOW(),INTERVAL 14 DAY), 1,  17.00, 0.00),
                                                                                   (11, 'Card',      DATE_SUB(NOW(),INTERVAL 13 DAY), 1,  17.50, 5.00),  -- 25 - 30% = 17.5
                                                                                   (12, 'Cash',      DATE_SUB(NOW(),INTERVAL 12 DAY), 1,  12.00, 0.00),
                                                                                   (13, 'Card',      DATE_SUB(NOW(),INTERVAL 11 DAY), 1,  13.00, 0.00),
                                                                                   (14, 'Cash',      DATE_SUB(NOW(),INTERVAL 10 DAY), 1,  28.00, 7.00),
                                                                                   (15, 'Cash',      DATE_SUB(NOW(),INTERVAL  9 DAY), 1,  19.00, 0.00),  -- 34 - 15fix = 19
                                                                                   (16, 'Card',      DATE_SUB(NOW(),INTERVAL  8 DAY), 1,  14.00, 5.00),
                                                                                   (17, 'Cash',      DATE_SUB(NOW(),INTERVAL  7 DAY), 1,   9.00, 0.00),
                                                                                   (18, 'Card',      DATE_SUB(NOW(),INTERVAL  6 DAY), 1,   7.00, 1.00),
                                                                                   (19, 'Card',      DATE_SUB(NOW(),INTERVAL  5 DAY), 1,   9.10, 3.00),  -- 13 - 30% = 9.1
                                                                                   (20, 'Cash',      DATE_SUB(NOW(),INTERVAL  4 DAY), 1,  19.00, 0.00),
                                                                                   (21, 'Cash',      DATE_SUB(NOW(),INTERVAL  3 DAY), 1,  11.00, 2.00),
                                                                                   (22, 'Card',      DATE_SUB(NOW(),INTERVAL  2 DAY), 1,   7.00, 0.00),
                                                                                   (23, 'Cash',      DATE_SUB(NOW(),INTERVAL  1 DAY), 1,  19.80, 5.00);  -- 22 - 10% = 19.8

-- ------------------------------------------------------------ --
-- 4.8 RECENZII (client -> sofer)                               --
-- ------------------------------------------------------------ --
INSERT INTO recenzie (sofer_id_sofer, client_id_client, rating, comentarii, tip_autor) VALUES
                                                                                           ( 1,  1,  5, 'Sofer foarte politicos si masina curata. Recomandat!',        'client'),
                                                                                           ( 3,  2,  4, 'Sosit la timp, traseu ok.',                                   'client'),
                                                                                           ( 6,  3,  5, 'Experienta excelenta, cu siguranta voi mai comanda.',         'client'),
                                                                                           ( 4,  4,  4, 'Conducere preventiva, m-am simtit in siguranta.',             'client'),
                                                                                           ( 2,  5,  3, 'Intarziere de 5 minute, dar altfel ok.',                      'client'),
                                                                                           ( 7,  6,  5, 'Muzica buna si atmosfera placuta!',                           'client'),
                                                                                           ( 9,  7,  4, 'Masina curata, sofer amabil.',                                'client'),
                                                                                           ( 5,  8,  5, 'A ajuns la destinatie rapid si in siguranta.',                'client'),
                                                                                           ( 8,  9,  5, 'Cel mai bun sofer de pana acum!',                            'client'),
                                                                                           ( 1, 10,  4, 'Bun in general, un pic grabit.',                              'client'),
                                                                                           (10, 11,  5, 'Sofer excelent, masina spatioasa si curata.',                 'client'),
                                                                                           ( 3, 12,  3, 'Traseu putin mai lung decat era necesar.',                    'client'),
                                                                                           ( 6, 13,  4, 'Sofer placut, experienta ok.',                               'client'),
                                                                                           (11,  1,  5, 'Masina XL perfecta pentru bagaje multe.',                     'client'),
                                                                                           ( 4,  3,  5, 'Punctual si amabil.',                                         'client'),
                                                                                           ( 7,  5,  4, 'Bun, fara probleme.',                                         'client'),
                                                                                           ( 2,  2,  4, 'A respectat limita de viteza, m-am simtit in siguranta.',     'client'),
                                                                                           (12,  9,  5, 'Rapid si amabil.',                                            'client'),
                                                                                           ( 6, 11,  5, 'Masina premium de calitate, sofer profesionist.',             'client'),
                                                                                           ( 8,  4,  2, 'Conducere agresiva prin oras, nu recomand.',                  'client'),
                                                                                           ( 1,  6,  5, 'Excelent! Punctual si politicos.',                            'client'),
                                                                                           ( 5,  7,  4, 'Ok, nimic de adaugat.',                                       'client'),
                                                                                           (99, 99,  5, 'Sofer de test perfect!',                                      'client');

-- ------------------------------------------------------------ --
-- 4.9 RECENZII (sofer -> client)                               --
-- ------------------------------------------------------------ --
INSERT INTO recenzie (sofer_id_sofer, client_id_client, rating, comentarii, tip_autor) VALUES
                                                                                           ( 1,  1,  5, 'Client politicos, a respectat masina.',                       'sofer'),
                                                                                           ( 3,  2,  4, 'Client ok, fara probleme.',                                   'sofer'),
                                                                                           ( 6,  3,  5, 'Client excelent, recomandat.',                                'sofer'),
                                                                                           ( 4,  4,  4, 'Client punctual.',                                            'sofer'),
                                                                                           ( 2,  5,  3, 'Client un pic nerabdator, dar ok.',                           'sofer'),
                                                                                           ( 7,  6,  5, 'Client placut si respectuos.',                                'sofer'),
                                                                                           ( 9,  7,  5, 'Client perfect!',                                             'sofer'),
                                                                                           ( 5,  8,  4, 'Client obisnuit, fara incident.',                             'sofer'),
                                                                                           ( 8,  9,  5, 'Client care stie unde vrea sa ajunga, precis si clar.',       'sofer'),
                                                                                           ( 1, 10,  4, 'Client bun.',                                                 'sofer'),
                                                                                           (99, 99,  5, 'Client de test!',                                             'sofer');

-- ------------------------------------------------------------ --
-- 4.10 CERTIFICATE SOFERI                                     --
-- ------------------------------------------------------------ --
INSERT INTO certificat (sofer_id_sofer, certificat_tip, data_exp_certif) VALUES
                                                                             ( 1, 'Permis de conducere', DATE_ADD(CURDATE(), INTERVAL 4 YEAR)),
                                                                             ( 1, 'Aviz psihologic',     DATE_ADD(CURDATE(), INTERVAL 1 YEAR)),
                                                                             ( 3, 'Permis de conducere', DATE_ADD(CURDATE(), INTERVAL 3 YEAR)),
                                                                             ( 6, 'Permis de conducere', DATE_ADD(CURDATE(), INTERVAL 5 YEAR)),
                                                                             ( 6, 'Aviz medical',        DATE_ADD(CURDATE(), INTERVAL 2 YEAR)),
                                                                             ( 7, 'Permis de conducere', DATE_ADD(CURDATE(), INTERVAL 2 YEAR)),
                                                                             ( 9, 'Permis de conducere', DATE_ADD(CURDATE(), INTERVAL 1 YEAR)),
                                                                             (99, 'Permis de conducere', DATE_ADD(CURDATE(), INTERVAL 4 YEAR));


/* ============================================================ */
/* PARTEA 5 - VIZUALIZARE DATE                                  */
/* ============================================================ */

SELECT 'CLIENTI' AS tabel, COUNT(*) AS total FROM client
UNION ALL SELECT 'SOFERI',  COUNT(*) FROM sofer
UNION ALL SELECT 'MASINI',  COUNT(*) FROM masina
UNION ALL SELECT 'CURSE',   COUNT(*) FROM cursa
UNION ALL SELECT 'PLATI',   COUNT(*) FROM plata
UNION ALL SELECT 'RECENZII',COUNT(*) FROM recenzie
UNION ALL SELECT 'DISCOUNTURI', COUNT(*) FROM discount;
