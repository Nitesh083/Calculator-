Architecture

Frontend:  built in React (or Vue, depending on comfort)

Backend API: Node.js + Express (or optionally Python Flask/FastAPI)

Database: SQLite for prototype (or light JSON + file store), or optionally MongoDB/lowdb

PDF/Report engine: Server-side HTML → render to PDF (using puppeteer or html-pdf)

Deployment / Run: Local dev mode, easily runnable via npm install / npm start (frontend + backend)

Component Flow

User enters inputs on UI → frontend calls /simulate (no persistence) → gets back computed metrics and displays

If user saves scenario: frontend sends scenario data to /scenario → backend stores in DB and returns scenario ID

Listing existing scenarios: UI fetches list from /scenarios → user can select, load, update, delete

Report generation: user provides email, then frontend calls /report/:id → backend renders report HTML, generates PDF, returns link or bytes

