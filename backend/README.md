# Remolink Discovery Mall — Python API (read-only scaffold)

FastAPI backend that serves the same product/store data the frontend currently
bundles in `src/data.js`. This is the first slice of the "keep the JS UI, move
data I/O to Python" hybrid plan. Read-only for now (no cart/save/auth writes).

## Run locally

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS / Linux:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- Health check: http://localhost:8000/
- Products:     http://localhost:8000/products
- Stores:       http://localhost:8000/stores
- Swagger docs: http://localhost:8000/docs

## Point the frontend at it

Create `remo-mall/.env.local` (gitignored) with:

```
VITE_API_BASE=http://localhost:8000
```

Then restart Vite. With `VITE_API_BASE` set, `src/api.js` fetches from this
backend; when it is empty (e.g. on GitHub Pages), the app falls back to the
bundled `src/data.js` so nothing breaks.

## Endpoints

| Method | Path                | Returns                    |
|--------|---------------------|----------------------------|
| GET    | `/`                 | health + counts            |
| GET    | `/products`         | all products               |
| GET    | `/products/{id}`    | one product (404 if none)  |
| GET    | `/stores`           | all stores                 |
| GET    | `/stores/{id}`      | one store (404 if none)    |

Image fields are **relative** paths (e.g. `assets/generated/products/keyring.png`);
the frontend prefixes them with its `BASE_URL`.

## Deploy (later)

GitHub Pages is static and cannot run Python. Host this API separately
(Render / Railway / Fly.io / Google Cloud Run), then set `VITE_API_BASE` to the
deployed URL at build time. Keep secrets (auth, payment keys) on this server —
never in the frontend bundle.
