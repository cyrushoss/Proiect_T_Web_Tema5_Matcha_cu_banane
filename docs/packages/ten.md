# Pachet TEN — izolare între organizații (multi-tenancy)

> Sursa: `01-architectural-challenges.md` (TEN — Izolare multi-tenant).
> **Cerință injectată:** organizații multiple folosesc platforma fără scurgeri de date între tenant-uri.
> **Verificare obligatorie:** teste negative de *citire, scriere, căutare și export* pentru cel puțin **3 organizații** (Alfa, Beta, Gamma).
> **Decizii de discutat:** filtrare tenant centralizată, constrângeri, politici de acces.
> Rubrica pachetului: implementare 40%, teste/dovezi reproductibile 30%, alternative și decizie 20%, limite documentate 10%.

## Problema
Un singur deploy servește mai multe organizații; o eroare de filtrare într-o rută, în căutare sau în export ar divulga date între organizații.

## Alternative
| Variantă | Avantaje | Dezavantaje |
|---|---|---|
| A. BD comună, coloană `organization_id` + repository tenant-scoped + FK compuse | Simplu, un singur schema, testabil, interogări eficiente cu indexuri compuse | Izolarea depinde de disciplina codului; mitigată de FK compuse și teste automate |
| B. Câte un fișier SQLite per organizație | Izolare fizică puternică, backup/ștergere per tenant | Conexiuni multiple, migrări N×, căutare/administrare mai grea, mai complex de testat |
| C. RLS (ex. PostgreSQL) | Izolare aplicată de SGBD | SQLite nu oferă RLS; implică alt SGBD (necesită aprobare) |

## Alegere propusă
**A, cu apărare în adâncime**: (1) `organizationId` luat doar din token; (2) un strat `tenantRepo(orgId)` care adaugă obligatoriu filtrul și este singurul mod de acces la modele; (3) FK compuse în BD; (4) căutare FTS filtrată pe org; (5) stocare fișiere pe cale `storage/<orgId>/…` verificată la descărcare; (6) export construit din același repository; (7) teste automate generate din lista de rute.

## Cele trei decizii cerute de fișă
1. **Filtrare tenant centralizată:** `tenantRepo(orgId)` este singurul acces la modele; rutele nu folosesc direct modelele Sequelize.
2. **Constrângeri:** `organization_id NOT NULL` și FK compuse `(organization_id, id)` fac referințele cross-tenant imposibile și dacă stratul de aplicație este ocolit.
3. **Politici de acces:** modulul unic `policy` (autentificare → organizație din token → rol → drept pe obiect), folosit de rute, căutare și export.

## Experimente/verificări
- Suita TEN din `docs/testing.md` §3, cu **3 organizații**, acoperind citire, scriere, căutare și export; rulată în CI.
- Test de mutație manuală: eliminarea intenționată a filtrului într-un repository trebuie să facă testele să pice.
- Comparație sumară A vs. B (dimensiune/complexitate) ca argument în ADR.

## Limite
Un bug în stratul comun afectează toți tenanții; lipsa izolării resurselor (zgomot între vecini: o organizație mare încetinește celelalte); fără criptare per tenant.
