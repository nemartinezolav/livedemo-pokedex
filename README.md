# Pokédex Angular 18

Aplicación de Pokédex construida con **Angular 18** (standalone components + signals),
que consume la [PokeAPI](https://pokeapi.co) pública para mostrar el listado completo
de Pokémon existentes, con filtros y tema oscuro.

## Características

- **Listado completo** de todos los Pokémon disponibles en la PokeAPI (más de 1300),
  con carga paginada ("Cargar más") para que la interfaz sea fluida.
- **Filtros**:
  - Por **nombre** (búsqueda en vivo).
  - Por **número de Pokédex** (rango mínimo/máximo).
  - Por **tipo/elemento** (selección múltiple: fuego, agua, planta, etc.).
  - Por **generación** (Kanto, Johto, Hoenn... hasta Paldea y formas especiales).
  - **Ordenar** por número o nombre (ascendente/descendente).
  - **Solo favoritos** (guardados en el navegador con `localStorage`).
- **Ficha de detalle** al hacer clic en un Pokémon: altura, peso, habilidades y
  estadísticas base, obtenidas bajo demanda de la API.
- **Favoritos** persistentes (corazón en cada tarjeta).
- **Tema oscuro** ("negro claro" / carbón) en toda la interfaz.
- Totalmente responsive (grid adaptable).

## Cómo funciona la carga de datos

Al iniciar, el servicio `PokemonService`:
1. Descarga el listado completo de nombres/IDs (`/pokemon?limit=100000`).
2. Descarga en paralelo los 18 tipos estándar (`/type/{tipo}`) para construir un
   mapa `id -> tipos` sin tener que golpear el endpoint individual de cada Pokémon.
3. Construye la imagen de cada Pokémon directamente desde el repositorio de sprites
   oficial (`official-artwork`), sin llamadas extra.

Esto permite que, tras la carga inicial (~20 peticiones), **todo el filtrado sea
instantáneo y 100% en el cliente**.

## Requisitos

- Node.js 18.19+ o 20+
- npm 10+

## Instalación y ejecución

```bash
npm install
npm start
```

Luego abre [http://localhost:4200](http://localhost:4200).

## Build de producción

```bash
npm run build
```

Los archivos se generan en `dist/pokedex-angular`.

## Estructura del proyecto

```
src/app/
├── components/
│   ├── pokemon-list/          # Página principal (orquesta filtros + grid + modal)
│   ├── pokemon-card/          # Tarjeta individual de Pokémon
│   ├── pokemon-filters/       # Panel de filtros
│   └── pokemon-detail-modal/  # Modal con detalle extendido
├── models/                    # Interfaces (Pokemon, Filters, Detail)
├── services/
│   ├── pokemon.service.ts         # Listado completo + tipos + generaciones
│   ├── pokemon-detail.service.ts  # Detalle bajo demanda (altura, stats, etc.)
│   └── favorites.service.ts       # Favoritos en localStorage
├── app.component.ts
├── app.config.ts
└── app.routes.ts
```

## Desplegar en GitHub Pages

Este proyecto ya incluye un workflow de GitHub Actions
(`.github/workflows/deploy.yml`) que compila y publica la app automáticamente
cada vez que se hace `push` a la rama `main`. El `base-href` se calcula solo
a partir del nombre del repositorio, así que no hay que tocar nada.

Pasos:

1. Crea un repositorio nuevo en GitHub (puede estar vacío, sin README).
2. Desde la carpeta del proyecto:
   ```bash
   git init
   git add .
   git commit -m "Pokedex Angular inicial"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```
3. En GitHub, ve a **Settings → Pages** y en "Build and deployment" elige
   **Source: GitHub Actions** (no "Deploy from a branch").
4. Con eso basta: el push ya disparó el workflow. Revísalo en la pestaña
   **Actions** del repo. Cuando termine (ícono verde), tu app quedará en:
   ```
   https://TU_USUARIO.github.io/TU_REPO/
   ```

Cualquier `push` posterior a `main` vuelve a desplegar automáticamente.

## Personalizar colores

Los colores del tema oscuro están centralizados como variables CSS en
`src/styles.scss` (`--bg-primary`, `--bg-secondary`, `--accent`, etc.).
