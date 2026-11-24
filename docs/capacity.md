# Profil de sarcină și capacitate

## 1. Volum de date (seed sintetic)
| Element | Cantitate |
|---|---|
| Organizații | 3 (Alfa, Beta, Gamma) |
| Utilizatori | ~20 per organizație (1–2 admini) |
| Foldere | ~30 per organizație (adâncime max. 4) |
| Documente | ≥1.200 total (~400 per organizație) |
| Versiuni | 1–5 per document (fișiere mici sintetice, 1–50 KB) |

Doar fișiere demonstrative generate, fără date personale.

## 2. Utilizatori simultani și mix de operații
| Operație | Pondere |
|---|---|
| Listare documente (filtrare/paginare) | 40% |
| Căutare | 20% |
| Descărcare versiune | 20% |
| Încărcare versiune nouă | 10% |
| Tranziții de stare / partajare | 5% |
| Login | 5% |

## 3. Niveluri de încărcare (k6 sau Artillery, ≥3 niveluri)
| Nivel | Utilizatori virtuali | Durată |
|---|---|---|
| Ușor | 10 | 2 min |
| Mediu | 50 | 3 min |
| Ridicat | 150 | 3 min |

Utilizatorii virtuali sunt împărțiți egal între cele 3 organizații, iar scriptul include și cereri care încearcă acces cross-tenant (trebuie să dea 404/403, nu să crească rata de erori reală).

## 4. Obiective
| Metrică | Țintă |
|---|---|
| p95 listare | < 300 ms la 50 VU |
| p95 căutare | < 500 ms la 50 VU |
| p95 descărcare | < 400 ms la 50 VU |
| Rata de erori (5xx/timeout) | < 1% |
| Capacitate susținută | ≥ 50 utilizatori simultani pe mediul de test |

## 5. Ce se raportează (la M3)
Throughput (RPS), p50/p95/p99, rata erorilor, CPU/RAM observate, descrierea mediului (CPU, RAM, SO, versiune Node). Nu se compară RPS între calculatoare diferite. Se estimează capacitatea susținută raportat la țintă și se identifică un blocaj probabil (candidați: SQLite cu un singur scriitor, căutarea FTS, I/O pe disc, hash bcrypt la login).

## 6. Reproductibilitate
`npm run seed` → `npm run start:prod` → `npm run load` (script în `load/`), cu seed fix și versiuni pinuite.
