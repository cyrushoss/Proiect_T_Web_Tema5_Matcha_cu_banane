# ADR-002 — Strategia de securitate și scanare (pachet SEC)

- **Status:** propus (M1), de validat prin scanare la M2–M3
- **Problema:** cum demonstrăm că aplicația este rezistentă la vulnerabilitățile uzuale (OWASP) și că remedierile rămân valabile?
- **Alternative:** (A) ZAP baseline + active autentificat + verificări manuale; (B) doar baseline pasiv; (C) doar teste proprii. Vezi `docs/packages/sec.md`.
- **Alegere:** A, pe instanță locală autorizată cu seed sintetic resetabil; fiecare alertă reală remediată primește un test de regresie.
- **Experiment/test:** raport ZAP înainte/după, registru de triere, teste de regresie în `tests/security/`.
- **Decizii cerute de fișă:** limitele scanării automate (ZAP nu vede logica de autorizare), securitatea sesiunii (cookie HttpOnly/SameSite sau Bearer cu expirare, rate limiting) și autorizarea pe obiect (modul `policy`, verificare la fiecare cerere).
- **Limite:** ZAP nu acoperă bine erorile de autorizare (acoperite prin TEN); scanarea activă poate modifica BD, de aceea se rulează pe copie de seed.
