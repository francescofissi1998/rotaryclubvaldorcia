# Rotary Club Val d'Orcia Community — sito

Sito statico esportato dalla pagina **“def”** del file Figma.
Nessun framework, nessun build step, **nessuna richiesta a server esterni**.

Dominio di riferimento: **https://www.rotaryclubvaldorcia.it/**

## Contenuto

```
index.html            landing page
privacy.html          informativa privacy (GDPR)
cookie.html           cookie policy
404.html              pagina di errore
css/site.css          stile della landing
css/legal.css         stile delle pagine legali
js/site.js            parallasse, reveal, menu
js/legal.js           navbar e menu pagine legali
images/               foto in WebP + fallback JPEG, in più larghezze
fonts/                Inter self-ospitato (woff2)
favicon.ico + PNG     ruota rotariana
site.webmanifest      manifest PWA
sitemap.xml           per Google Search Console
robots.txt            regole crawler + rimando alla sitemap
.htaccess             header di sicurezza per Apache
_headers              header di sicurezza per Netlify / Cloudflare Pages
nginx-headers.conf    snippet header per nginx
pdf/                  (vuota) qui vanno i PDF della rassegna stampa
```

> **Caricare tutto il contenuto della cartella**, mantenendo le sottocartelle.
> La cartella pesa ~7 MB su disco perché contiene più versioni di ogni foto,
> ma **il browser ne scarica una sola**: vedi sotto.

---

## 1. Prestazioni

| | Prima | Ora |
|---|---|---|
| Peso iniziale (desktop) | 4.366 KB | **~314 KB** |
| Peso iniziale (mobile) | 4.366 KB | **~181 KB** |
| Pagina intera, tutto caricato | 4.366 KB | **~1.073 KB** |
| Reflow forzati durante lo scroll | 177 ms | **0** |

**Come è stato ottenuto**

- **WebP con fallback JPEG.** Ogni foto esiste in `.webp` e `.jpg`; il tag
  `<picture>` fa scegliere al browser il formato migliore. Risparmio 30–50%.
- **Immagini responsive.** Ogni foto ha più larghezze (800 / 1440 / 2400 px) con
  `srcset` + `sizes`: su telefono si scarica la versione piccola, su desktop
  quella grande. La hero passa da 1.459 KB a 74 KB su mobile.
- **LCP individuabile.** Gli sfondi non sono più `background-image` in CSS (che il
  preload scanner non vede) ma `<img>` reali con `fetchpriority="high"` e
  `<link rel="preload" imagesrcset>`.
- **Niente layout thrashing.** `js/site.js` separa le letture geometriche
  (solo a `load` e `resize`, con i valori in cache) dalle scritture di
  `transform`, eseguite dentro `requestAnimationFrame`. Durante lo scroll non
  viene letta **nessuna** proprietà geometrica: verificato strumentando
  `getBoundingClientRect`, `offsetHeight` e `offsetTop`.
- **`width`/`height` su tutte le immagini**, loghi compresi → niente layout shift (CLS).
- **Loghi in PNG con palette**: 44 KB → 17 KB (qui il PNG batte il WebP).
- **Animazioni compositate**: solo `transform` e `opacity`, mai proprietà che
  causano layout.

---

## 2. Prima della pubblicazione

1. **Privacy** — inserire **sede legale** e **codice fiscale / P.IVA** in
   `privacy.html` (righe “Da aggiungere”, evidenziate in giallo).
2. **Rassegna stampa** — vedi sezione 5.
3. Se il dominio cambia, aggiornare l'host in `sitemap.xml`, `robots.txt` e nei
   tag `canonical` / `og:` / JSON-LD delle tre pagine.

---

## 3. Header di sicurezza

CSP, `nosniff` e referrer-policy sono già presenti come `<meta>` in ogni pagina:
valgono su qualunque hosting, GitHub Pages compreso.

Le direttive che **richiedono header HTTP veri** — `Strict-Transport-Security`,
`X-Frame-Options`, `frame-ancestors`, `Cross-Origin-Opener-Policy`,
`Permissions-Policy`, `require-trusted-types-for` — non possono essere impostate
da HTML. Sono pronte in tre formati:

| Hosting | File |
|---|---|
| Apache (hosting Register.it) | `.htaccess` — basta caricarlo |
| nginx | `nginx-headers.conf` — da consegnare all'assistenza |
| Netlify / Cloudflare Pages | `_headers` |
| **GitHub Pages** | **nessuno**: non consente header personalizzati |

Se l'analisi mostra `Server: nginx`, il sito passa da un reverse proxy
(probabilmente Register.it) e gli header **si possono** configurare: provare prima
`.htaccess`, poi aprire un ticket allegando `nginx-headers.conf`.
Verificare il risultato su <https://securityheaders.com>.

⚠️ **HSTS — attivare per gradi.** Nel `.htaccess` c'è una riga commentata con
`max-age=300`: usare prima quella, verificare che HTTPS funzioni su **tutti** i
sottodomini, e solo dopo passare a `31536000`. Con `includeSubDomains` un
sottodominio senza certificato diventa irraggiungibile, e i browser lo ricordano
per un anno.

⚠️ **`require-trusted-types-for 'script'`** è incluso: il sito non usa `innerHTML`
né altre sink DOM-XSS, quindi è sicuro. Se in futuro venisse aggiunto uno script
che scrive HTML dinamicamente, andrà rimosso o adattato.

**SSL/TLS** — il report segnalava “No SSL/TLS information available”: verificare
che il certificato del dominio sia attivo e valido presso Register.it. Senza
HTTPS funzionante, HSTS non va attivato.

---

## 4. SEO

- `<title>` e `meta description` unici per pagina, `canonical` su tutte;
- Open Graph + Twitter Card;
- **JSON-LD** `schema.org/NGO` con nome, logo, email, area servita, profili social;
- `sitemap.xml` (3 URL + immagini) e `robots.txt`;
- un solo `<h1>` per pagina, `alt` su tutte le immagini, link “Salta al contenuto”.

**Google Search Console**: aggiungere la proprietà, verificarla con record TXT sul
DNS Register.it, poi **Sitemap → Aggiungi sitemap →** `sitemap.xml`.

---

## 5. Rassegna stampa — come caricare i PDF

1. Mettere il file in `pdf/` (es. `pdf/articolo-1.pdf`).
2. In `index.html` cercare il commento `<!-- Per pubblicare: ... -->` e
   trasformare la scheda `<article class="pcard">` in un link:

```html
<a class="pcard" href="pdf/articolo-1.pdf" target="_blank" rel="noopener">
  <div class="meta"><span class="badge">PDF</span><span class="src">Il Cittadino · Marzo 2026</span></div>
  <h3>Titolo reale dell'articolo</h3>
  <p>Breve estratto.</p>
  <span class="open">Apri il PDF <svg …></svg></span>
</a>
```

---

## 6. Immagini — nota sulla qualità

Tre foto hanno una **sorgente a bassa risoluzione** e non possono essere più
nitide di così:

| File | Sorgente disponibile | Mostrata a |
|---|---|---|
| `about` (i Cipressini) | 415×739 | 484×568 |
| `panel1` (Rocca di Campiglia) | 1280×853 | 1440 px di larghezza |
| `join` (Podere Terrapille) | 1250×834 | 1440 px di larghezza |

Per averle più definite serve lo scatto originale a risoluzione maggiore.
Tutte le altre sono già a 2× rispetto alla dimensione di visualizzazione.

---

## 7. Nota sul DOM

Lighthouse segnala 333 elementi: è un valore **basso e sano** (la soglia di
allarme è 800). Non richiede interventi.
