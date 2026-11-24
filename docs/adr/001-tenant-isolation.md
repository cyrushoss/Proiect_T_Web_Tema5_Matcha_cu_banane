# ADR-001 — Strategia de izolare multi-tenant (pachet TEN)

- **Status:** propus (M1), de validat prin experiment la M2
- **Problema:** cum garantăm că datele unei organizații nu sunt accesibile altora prin API, căutare, descărcare sau export (invariantul I1)?
- **Alternative:** (A) BD comună cu `organization_id` și FK compuse; (B) un fișier SQLite per organizație; (C) RLS în alt SGBD. Vezi `docs/packages/ten.md`.
- **Alegere:** A, cu apărare în adâncime: tenant din token, `tenantRepo(orgId)` ca unic acces la date, FK compuse `(organization_id, id)`, FTS filtrat pe organizație, căi de stocare pe organizație, test generat din lista de rute.
- **Experiment/test:** suita TEN (`tests/ten/*.test.js`) + test la nivel de BD (inserție cross-tenant → eroare FK) + test de mutație (eliminarea unui filtru trebuie să pice testele).
- **Limite:** un bug în stratul comun afectează toți tenanții; fără izolarea resurselor între organizații.
