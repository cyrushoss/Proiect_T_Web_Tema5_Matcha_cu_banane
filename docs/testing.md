# Plan de teste

Instrumente propuse: Vitest/Jest + Supertest (backend), Playwright (E2E), c8/Istanbul pentru coverage, k6/Artillery pentru sarcină.

## 1. Unitate (reguli de business)
- Mașina de stări a documentului (toate tranzițiile valide și invalide, I6).
- Numerotarea versiunilor (I4), regula ultimului admin (I5).
- Funcția de politică de autorizare: matrice rol × acțiune × relație cu obiectul × organizație.
- Validatori (tip/dimensiune fișier, paginare, sortare).

## 2. Integrare (API + persistență, BD de test izolată)
- Login, sesiuni, logout.
- CRUD foldere/documente/versiuni, filtrare, ordonare, paginare.
- Partajare: acordare, modificare, revocare cu efect imediat (I3).
- Constrângeri BD: FK compuse resping referințe cross-tenant chiar dacă stratul de aplicație ar fi ocolit (I2).
- Serviciul de scanare: răspuns clean, infected, timeout, 5xx.

## 3. Pachetul TEN — teste de acces între organizații (obligatoriu)
Setup: **3 organizații** (Alfa, Beta, Gamma), fiecare cu utilizatori `ADMIN` și `MEMBER`. Fișa cere teste negative de **citire, scriere, căutare și export**.
Pentru fiecare endpoint din tabelul API care primește un id sau întoarce o colecție:
1. Utilizator din Beta cere resursa Alfa după id → 404.
2. Listările/filtrele/sortarea/paginarea nu includ niciodată date din altă organizație.
3. Căutarea cu termeni care există doar în Alfa, rulată din Beta → 0 rezultate.
4. Descărcarea versiunii Alfa din Beta → 404; manipulare de path/id → 404.
5. Export ZIP: arhiva ADMIN-ului Beta nu conține niciun fișier/metadată Alfa.
6. Partajare cu utilizator din altă organizație → refuzată; `organizationId` trimis în body/query este ignorat.
6b. **Scriere:** utilizator din Beta încearcă `PATCH`/`DELETE`/`POST` pe resurse Alfa (document, folder, versiune nouă, tranziție, partajare, utilizator) → 404, iar starea din BD rămâne neschimbată.
6c. Verificările 1–6 se repetă pentru perechile Alfa↔Gamma și Beta↔Gamma.
7. Test generat automat din lista de rute: nicio rută cu parametru de resursă nu rămâne neacoperită.
8. Test la nivel de BD: inserție directă cu referință cross-tenant → eroare FK.

## 4. Pachetul SEC — vezi `docs/packages/sec.md`
Teste de regresie pentru fiecare vulnerabilitate remediată în urma scanării ZAP, plus:
- **Cross-user (aceeași organizație):** MEMBER A nu citește, modifică, descarcă sau partajează documentul nepartajat al MEMBER B; manipulare de id (IDOR) pe fiecare rută cu parametru.
- **Sesiune:** token expirat/modificat/reutilizat după logout → 401; rate limiting la login.
- **Raport ZAP** înainte/după și registru de triere (`docs/packages/sec.md`).
Fișier planificat: `tests/security/*.test.js`.

## 5. Teste negative
Intrări invalide (câmpuri lipsă, tipuri greșite, id-uri negative, fișiere prea mari/tip nepermis), `MEMBER` încearcă operații de `ADMIN` (403), token expirat/modificat (401), mass-assignment (`role`, `organizationId`), injecții SQL în `q`/`sort`.

## 6. End-to-end (Playwright, minimum 1 flux)
Login MEMBER → creare document → încărcare versiune → trimitere spre aprobare → login ADMIN → aprobare → căutare → descărcare. Variantă negativă: MEMBER nu vede acțiunea de aprobare, iar apelul direct la API este refuzat.

## 7. Coverage
Țintă: ≥70% statement, ≥60% branch pe codul backend scris în proiect. Excluderi documentate: migrări, seed, config, cod generat. Raport scurt cu lacunele și riscurile asociate, în acest fișier la M3.

## 8. Matricea invarianți → teste
| Invariant | Nivel | Fișier de test (planificat) |
|---|---|---|
| I1 | integrare + TEN | `tests/ten/*.test.js` |
| I2 | BD | `tests/db/constraints.test.js` |
| I3 | integrare | `tests/api/sharing.test.js` |
| I4 | unitate + BD | `tests/unit/versions.test.js` |
| I5 | integrare | `tests/api/users.test.js` |
| I6 | unitate | `tests/unit/stateMachine.test.js` |
| I7 | integrare | `tests/security/leaks.test.js` |
| I8 | integrare | `tests/api/upload.test.js` |
