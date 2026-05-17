# SmartTransit 🚖

Aplicatie web de tip taxi/ride-sharing cu panou de administrare, interfata pentru clienti si interfata pentru soferi.

---

## Tehnologii folosite

| Strat | Tehnologie |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express |
| Baza de date | MySQL (local) / Aiven Cloud (productie) |
| Harta | Google Maps API |

---

## Structura proiectului

```
SmartTransit/
├── back_end/
│   ├── server.js          # API Express cu toate rutele
│   ├── package.json
│   └── .env               # Creat de tine (vezi .env.example)
├── front_end/
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/     # Paginile aplicatiei (admin, client, driver)
│   │   │   ├── components/ # Componente reutilizabile
│   │   │   └── routes.tsx  # Configurare rute React Router
│   │   ├── styles/        # CSS global si tema
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── sql/
│   └── console.sql        # Schema BD + date de test
├── seed.py                # Script Python pentru populare automata BD
└── .env.example           # Template variabile de mediu
```

---

## Instalare si rulare

### 1. Cerinte prealabile

- [Node.js](https://nodejs.org/) v18 sau mai nou
- [MySQL](https://dev.mysql.com/downloads/) (pentru rulare locala)
- [Python 3](https://www.python.org/) (optional, doar pentru seed.py)

---

### 2. Configurare baza de date

**Varianta locala:**

1. Deschide MySQL Workbench (sau alt client SQL)
2. Ruleaza fisierul `sql/console.sql` in intregime
3. Baza de date `taxidb` va fi creata si populata automat cu date de test

**Varianta cloud (Aiven):**
Se face automat fara nicio schimbare a codului din server.js

---

### 3. Configurare backend

```bash
cd back_end
npm install
```

Modifica codul din server.js prin decomentarea codului:

```bash
const db = mysql.createConnection({
    host: 'localhost', 
    user: 'root',      
    password: '',      
    database: 'taxidb',
    port: 3306         
});
```

Porneste serverul:

```bash
node server.js
# sau cu reincarcari automate:
npx nodemon server.js
```

Serverul ruleaza pe `http://localhost:5050`

---

### 4. Configurare frontend

```bash
cd front_end
npm install
npm run dev
```

Aplicatia ruleaza pe `http://localhost:5173`

---

## Conturi de test

| Tip | Email | Parola |
|---|---|---|
| Client | `client@site.test` | `client` |
| Sofer | `sofer@site.test` | `sofer` |
| Admin | *(orice email)* | `admin123` |

Exista de asemenea 15 clienti si 15 soferi generati automat (parola: `client123` / `sofer123`).

---

## Functionalitati principale

**Client**
- Inregistrare / autentificare
- Comandare cursa cu selectie categorie (Economy, Standard, Premium, XL)
- Vizualizare cursa activa in timp real (polling)
- Aplicare cod de discount
- Adaugare tips pentru sofer
- Istoric calatorii cu detalii plata
- Lasare recenzie dupa cursa
- Editare profil si metoda de plata

**Sofer**
- Autentificare si management status (online/offline)
- Vizualizare curse disponibile filtrate pe categoria masinii
- Acceptare si finalizare cursa
- Calcul pret final cu variatie aleatorie (+/- 10 lei)
- Istoric castiguri
- Lasare recenzie client
- Gestionare profil, masina si certificate

**Admin** *(panou separat)*
- Dashboard cu statistici generale
- CRUD clienti si soferi (cu dezactivare logica)
- Gestionare flota auto
- Creare si alocare discounturi catre clienti
- Vizualizare si stergere recenzii
- Istoric complet curse

---

## Baza de date — tabele principale

```
sofer          — conturi soferi
masina         — flotă auto (1:1 cu sofer)
client         — conturi clienti
cursa          — curse (Waiting Driver / In ride / Ride Finished / Canceled)
plata          — plati asociate curselor finalizate
recenzie       — recenzii bidirectionale (client->sofer si sofer->client)
discount       — coduri promotionale
client_has_discount — relatie N:M clienti-discounturi
certificat     — documente soferi
administrativ  — personal administrativ
tranzactii     — tranzactii financiare interne
```
