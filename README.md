# Rotary Club Val d'Orcia — sito

Sito statico a pagina singola, esportato dalla pagina **“def”** del file Figma
(frame *V43 · Zig-Zag Dark Panels*).

## Contenuto

```
index.html          la pagina completa (HTML + CSS + JS inline, nessuna dipendenza)
images/             15 immagini (≈4,7 MB totali)
```

Nessun build step, nessun framework. L'unica risorsa esterna è il font
**Inter** da Google Fonts (con fallback di sistema se non disponibile).

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

## Da personalizzare

- `+39 0577 000 000` — numero di telefono segnaposto.
- `Privacy` / `Cookie` / `Credits` nel footer puntano a `#top`: sostituire con
  le pagine reali quando disponibili.
- Le immagini provengono da Unsplash e dai file forniti dal club.
