# Rotary Club Val d'Orcia — sito

Sito statico a pagina singola, esportato dalla pagina **“def”** del file Figma
(frame *V43 · Zig-Zag Dark Panels*).

## Contenuto

```
index.html            la landing page (HTML + CSS + JS inline)
privacy.html          informativa privacy (GDPR)
cookie.html           cookie policy
legal.css             stile condiviso delle due pagine legali
fonts/                font Inter self-ospitato (2 file woff2, 130 KB)
images/               15 immagini (≈4,6 MB totali)
favicon.ico           favicon multi-size (16/32/48) — ruota rotariana
favicon-16x16.png     favicon PNG
favicon-32x32.png     favicon PNG
apple-touch-icon.png  icona iOS 180×180 (ruota su fondo blu)
icon-192.png          icona PWA
icon-512.png          icona PWA
site.webmanifest      manifest (nome, colori, icone)
```

**Caricare TUTTO il contenuto della cartella**, mantenendo le sottocartelle
`images/` e `fonts/`. Se si carica solo `index.html` le immagini non appaiono.

Nessun build step, nessun framework, **nessuna richiesta a server esterni**.

> **Importante — GDPR:** il font Inter è ospitato localmente in `fonts/`.
> NON reintrodurre il link a `fonts.googleapis.com`: caricare i font dal CDN di
> Google trasmette l'IP di ogni visitatore a Google, pratica sanzionata in sede
> giudiziaria europea (LG München, 3 O 17493/20) e incompatibile con quanto
> dichiarato nella cookie policy.

## Pubblicazione su GitHub Pages

1. Copiare `index.html` e la cartella `images/` nella **root** del repository
   (es. `username.github.io`).
2. Su GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**,
   selezionare `main` e cartella `/ (root)`.
3. Il sito sarà online su `https://username.github.io/`.

> Se invece il repo è un progetto (es. `username.github.io/rotary`), i percorsi
> delle immagini sono **relativi** (`images/…`), quindi funzionano comunque
> senza modifiche.

## Sezioni

Nav → Hero → Statistiche → Panel UNESCO → Chi siamo → Cos'è il Rotary →
7 Aree di intervento → Citazione → Diventa socio → Footer

## Effetti

- **Parallax** su tutte le immagini di sfondo (hero, panel, Cos'è il Rotary,
  citazione, CTA) e sulle 7 immagini delle aree, a velocità differenziate.
  Implementato con `transform: translate3d` e `requestAnimationFrame`.
- **Scroll reveal** progressivo (fade + slide) con `IntersectionObserver`.
- **Navbar adattiva**: trasparente con logo bianco sull'hero, diventa bianca
  con logo blu dopo lo scroll.
- **Menu mobile** a tendina sotto gli 860px.
- Tutto rispetta `prefers-reduced-motion`: con l'impostazione attiva le
  animazioni sono disattivate e i contenuti restano pienamente visibili.

## Link esterni

| Voce | URL |
|---|---|
| Rotary International | https://www.rotary.org/ |
| Fondazione Rotary | https://www.rotary.org/it-it/who-we-are/the-rotary-foundation |
| Distretto 2071 | https://www.rotary2071.org/ |
| Rotaract | https://www.rotary.org/it-it/get-involved/our-clubs/rotaract-clubs |
| Interact | https://www.rotary.org/it-it/get-involved/youth-programs/interact-clubs |
| Facebook | https://www.facebook.com/profile.php?id=61577352394072 |
| Instagram | https://www.instagram.com/rotaryclubvaldorcia/ |

Tutti aperti in nuova scheda con `rel="noopener"`.
Email e telefono usano `mailto:` / `tel:`.

## Rassegna stampa — come caricare i PDF

La sezione **“Hanno parlato di noi”** contiene 3 schede segnaposto.
Per pubblicare un articolo reale:

1. Creare una cartella `pdf/` accanto a `index.html` e copiarci il file
   (es. `pdf/articolo-1.pdf`).
2. In `index.html` cercare `<!-- SOSTITUIRE href con il PDF reale -->` e
   trasformare la scheda `<article class="pcard">` in un link:

```html
<a class="pcard" href="pdf/articolo-1.pdf" target="_blank" rel="noopener">
  <div class="meta"><span class="badge">PDF</span><span class="src">Il Cittadino · Marzo 2026</span></div>
  <h3>Titolo reale dell'articolo</h3>
  <p>Breve estratto dell'articolo.</p>
  <span class="open">Apri il PDF <svg …></svg></span>
</a>
```

3. Rimuovere `aria-disabled="true"`.
   Per aggiungere altre schede basta duplicare il blocco: la griglia si adatta.

## Da personalizzare

- `+39 0577 000 000` — numero di telefono segnaposto.
- `Privacy` / `Cookie` / `Credits` nel footer puntano a `#top`: sostituire con
  le pagine reali quando disponibili.
- **Crediti fotografici**: verificare che le attribuzioni nella sezione
  “Crediti fotografici” corrispondano esattamente alle immagini pubblicate e
  che si disponga della licenza per l'uso online (in particolare per gli
  scatti di Luca Gino Photography e Shutterstock).
