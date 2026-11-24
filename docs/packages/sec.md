# Pachet SEC — scanare OWASP ZAP, remediere, regresie

> Sursa: `01-architectural-challenges.md` (SEC — Evaluare securitate cu OWASP ZAP) și §6 din specificația generală.
> **Cerință injectată:** plan de test de securitate pe o instanță controlată; scanare, triere, remediere și teste manuale.
> **Verificare obligatorie:** raport ZAP, rezultate explicate, teste de acces la obiectele altui utilizator, regresie după remedieri.
> **Decizii de discutat:** limitele scanării automate, securitatea sesiunii, autorizarea pe obiect.
> Rubrica pachetului: implementare 40%, teste/dovezi reproductibile 30%, alternative și decizie 20%, limite documentate 10%.

## Problema
Aplicația expune upload, căutare, autentificare și export; trebuie dovedit că vulnerabilitățile uzuale au fost căutate sistematic, triate și remediate, fără ca scanarea automată să înlocuiască verificările manuale de autorizare.

## Mediu autorizat
Scanarea se face **doar** pe instanța locală a echipei (`localhost`, BD seed sintetică), pornită special pentru test. Niciodată pe sisteme terțe.

## Alternative
| Variantă | Avantaje | Dezavantaje |
|---|---|---|
| A. ZAP baseline (pasiv) + ZAP full/active scan cu context autentificat (MEMBER și ADMIN) | Acoperire bună, raport reproductibil, gratuit | Scanarea activă e lentă și poate polua BD (se rulează pe seed resetabil) |
| B. Doar ZAP baseline pasiv | Rapid, sigur | Nu găsește injecții sau probleme de autorizare |
| C. Doar verificări manuale + teste proprii | Control deplin | Fără dovadă independentă de scanare |

## Alegere propusă
**A**, completată de verificări manuale de autorizare (suita TEN). Fluxul: seed → pornire în mod producție → ZAP (baseline + active, autentificat) → raport (HTML/JSON) → triere (true/false positive, severitate) → remediere → rescanare → test de regresie per vulnerabilitate remediată.

## Cele trei decizii cerute de fișă
1. **Limitele scanării automate:** ZAP nu înțelege regulile de business și nu detectează bine accesul la obiectele altui utilizator; de aceea scanarea este completată de teste manuale/automate de autorizare (cross-user și cross-tenant).
2. **Securitatea sesiunii:** cookie `HttpOnly` + `SameSite` (+ `Secure` în producție) sau Bearer cu expirare scurtă; invalidare la logout; rate limiting pe login; fără token în URL sau în loguri. Alegerea finală se documentează în ADR-002.
3. **Autorizarea pe obiect:** verificare pe fiecare cerere și pe fiecare obiect (autor / partajare / admin), prin modulul `policy`; accesul la obiectul altui utilizator nu trebuie să reușească (404/403).

## Teste manuale obligatorii (cross-user)
- MEMBER A încearcă să citească, modifice, descarce și partajeze documentul nepartajat al MEMBER B din **aceeași** organizație → refuzat.
- MEMBER încearcă endpointuri ADMIN (403); manipulare de id-uri (IDOR) pe fiecare rută cu parametru.
- Sesiune: token expirat/modificat → 401; reutilizare după logout → 401.

## Măsuri de bază planificate
- Parole cu bcrypt/argon2; secrete doar în `.env` (nu în repo); redactare în loguri.
- Interogări parametrizate (Sequelize), validare strictă pe `q`, `sort`, `page`, `pageSize` (allowlist).
- Rate limiting pe login; mesaje de eroare generice; `helmet` pentru anteturi (CSP, X-Content-Type-Options, etc.).
- CORS cu allowlist explicit; cookie `HttpOnly`, `SameSite`, `Secure` în producție; protecție CSRF dacă se folosesc cookie-uri.
- Upload: allowlist de tipuri, limită de dimensiune, nume de fișier regenerat, fără path din client, `Content-Disposition: attachment` la descărcare.
- Export ZIP: protecție împotriva path traversal / zip slip.

## Registru de triere (se completează la M2–M3)
| ID alertă ZAP | Severitate | Verdict | Remediere | Test de regresie |
|---|---|---|---|---|
| – | – | – | – | – |

## Limite
ZAP nu detectează bine erori de logică/autorizare (ex. IDOR între organizații): acestea sunt acoperite manual prin TEN. Rezultatele depind de configurația contextului și a autentificării.
