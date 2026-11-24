# Cerințe — Documente pentru organizații multiple

## 1. Scop
Aplicație web în care organizații independente (tenanți) își gestionează foldere, fișiere, metadate și versiuni, cu căutare și partajare **doar în interiorul aceleiași organizații**.

## 2. Actori și roluri
| Rol | Descriere | Permisiuni |
|---|---|---|
| `ORG_ADMIN` (privilegiat) | Administrator al unei organizații | Gestionează membri și roluri, creează/șterge foldere, aprobă/arhivează documente, setează reguli de partajare, exportă, vede jurnalul de audit al organizației |
| `MEMBER` (obișnuit) | Membru al unei organizații | Creează documente și versiuni în folderele la care are acces, editează propriile documente, caută, descarcă, trimite spre aprobare, vede doar ce i-a fost partajat |
| Anonim | Neautentificat | Doar login și health check |

Un utilizator aparține la **o singură organizație** (simplificare documentată; extensia de partajare între organizații este opțională, vezi §7).

## 3. Entități (rezumat)
Organization, User, Membership/rol, Folder (arbore), Document (metadate: titlu, descriere, etichete, status), DocumentVersion (fișier, hash, mărime, nr. versiune), ShareRule (folder/document → utilizator sau rol), AuditLog.

## 4. Fluxuri de utilizator (criterii de acceptare)

### F1. Autentificare și acces
- **Dat** un utilizator valid, **când** se autentifică, **atunci** primește token/cookie și vede doar organizația proprie.
- Credențiale greșite → 401 cu mesaj generic; rate limiting după 5 încercări eșuate.
- Parola este stocată cu hash (bcrypt/argon2).

### F2. Încărcare document și versiuni (MEMBER)
- Un membru creează un document într-un folder permis și încarcă prima versiune (v1).
- Încărcarea unei noi versiuni creează `version_no + 1`; versiunile vechi rămân descărcabile și imutabile.
- Fișierul este verificat de serviciul extern (scanner antivirus simulat) înainte să devină disponibil; dacă scanarea eșuează, versiunea este respinsă (422) sau pusă în `scan_failed`.
- Tipuri și dimensiuni limitate (validare pe server); doar fișiere demonstrative.

### F3. Căutare și descărcare
- Căutarea după titlu, metadate, etichete și conținut text returnează doar documentele din organizația utilizatorului **și** vizibile conform regulilor de partajare.
- Filtrare (folder, status, etichetă, autor, dată), ordonare și paginare (`page`, `pageSize`, `sort`).
- Descărcarea unei versiuni verifică organizația și dreptul de citire pe fiecare cerere.

### F4. Partajare în organizație
- Documentul/folderul poate fi partajat cu un utilizator sau cu un rol din aceeași organizație, cu drept `READ` sau `WRITE`.
- Modificarea sau revocarea unei partajări are efect imediat pe server (următoarea cerere este refuzată).
- Partajarea cu un utilizator din altă organizație → 403/404.

### F5. Ciclu de aprobare (flux cu stări)
Stări: `DRAFT → IN_REVIEW → APPROVED → ARCHIVED`, plus `IN_REVIEW → DRAFT` (respins).
- Autorul trimite `DRAFT → IN_REVIEW` (necesită ≥1 versiune curată).
- Doar `ORG_ADMIN` face `IN_REVIEW → APPROVED` sau `→ DRAFT` (cu motiv obligatoriu).
- `APPROVED` nu mai acceptă versiuni noi, doar `ARCHIVED` sau reluare prin creare de ciclu nou (admin).
- Orice tranziție invalidă → 409 cu cod de eroare explicit; toate tranzițiile se scriu în audit.

### F6. Administrare organizație (ORG_ADMIN)
- Adaugă/dezactivează membri, schimbă roluri, vizualizează auditul, exportă documentele organizației (ZIP).
- Un `MEMBER` care încearcă aceste operații primește 403 (verificat pe server).
- Nu se poate elimina ultimul `ORG_ADMIN` al unei organizații.

## 5. Invarianți și reguli critice (protejați în backend/BD)
| ID | Invariant | Aplicare |
|---|---|---|
| I1 | Niciun utilizator nu obține, prin API, căutare, descărcare sau export, date ale altei organizații | Filtru obligatoriu pe `organization_id` în stratul de acces + chei străine compuse în BD + teste TEN |
| I2 | Orice relație între entități rămâne în aceeași organizație (document↔folder↔versiune↔partajare) | FK compuse `(organization_id, id)` |
| I3 | Schimbările de permisiuni se aplică pe server, imediat; UI-ul nu este sursă de adevăr | Autorizare evaluată la fiecare cerere, fără cache de permisiuni de lungă durată |
| I4 | Versiunile sunt imutabile și numerotate consecutiv, unic per document | `UNIQUE(document_id, version_no)`, fără endpoint de update/delete pe versiune |
| I5 | O organizație are mereu ≥1 `ORG_ADMIN` activ | Verificare în tranzacție |
| I6 | Tranzițiile de stare respectă graful din F5 | Mașină de stări în serviciu + `CHECK` pe status |
| I7 | Parolele și secretele nu apar în răspunsuri sau jurnale | Teste negative + redactare în loguri |
| I8 | Dimensiunea și tipul fișierelor sunt validate pe server | Middleware de upload + test |

## 6. Cerințe nefuncționale (rezumat)
Interfață responsivă, stări de încărcare/eroare în UI, răspunsuri de eroare coerente `{ error: { code, message, details } }`, seed sintetic cu 3 organizații și ≥1.000 documente, coverage ≥70% statement / ≥60% branch pe backend.

## 7. Extensie opțională
Partajare între organizații numai cu acord explicit al ambelor părți și politică documentată (`ORG_ADMIN` al proprietarului inițiază, `ORG_ADMIN` al destinatarului acceptă, revocabil, audit). Nu se implementează înainte ca baza obligatorie și pachetele să fie validate.
