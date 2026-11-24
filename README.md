# Documente pentru organizații multiple (TEN + SEC)

Aplicație web full-stack: organizații independente își gestionează foldere, documente și versiuni, cu izolare strictă între organizații.
Stack: JavaScript (ESM), Node.js + Express, Sequelize + SQLite, React + Vite.

## Echipa
| Nume | Rol / contribuții |
|---|---|
|Sepahpour Cyrus-Alexandru  |Repo, cerințe, schemă ER                     |
|Sofonea Andreea-Maria      |API, schelet, capacitate, teste generale     |
|Tiloi Raluca-Ioana         |Pachetele TEN și SEC, ADR-uri, teste TEN/SEC |

## Instalare
```bash
cp backend/.env.example backend/.env   
npm run install:all
```

## Rulare (dezvoltare)
```bash
npm run dev:backend    # http://localhost:3000/api/health
npm run dev:frontend   # http://localhost:5173
```

## Teste
```bash
npm test
```
Coverage, E2E, seed, încărcare și rulare în producție: se adaugă la M2–M3 (`npm run seed`, `npm run start:prod`, `npm run load`).

## Documentație
`docs/requirements.md`, `docs/architecture.md`, `docs/testing.md`, `docs/capacity.md`, `docs/ai-usage.md`, `docs/adr/`, `docs/packages/` (TEN, SEC).

## Stadiu
M1: documente de analiză/design + schelet executabil (health endpoint, conexiune BD cu `PRAGMA foreign_keys = ON`, frontend Vite).
