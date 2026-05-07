# BloodDragons - D&D 5e Virtual Tabletop

## Arquitetura

Este projeto foi desacoplado em **Frontend** e **Backend**:

```
BloodDragons/
├── backend/    → Java 21 + Spring Boot 3.4 (API REST)
├── frontend/   → Angular 21 (Interface Visual)
├── .rules/     → Regras D&D 5e de referência
└── docker-compose.yml
```

### Backend (Java)
Toda a lógica de negócio reside no backend:
- **DndMathService** — Cálculos matemáticos, geometria AoE, dice rolling
- **DndCoreEngineService** — Motor de regras D&D 5e (ataques, dano, saving throws)
- **CombatService** — Resolução de combate, XP, level up
- **CampaignService** — CRUD de campanhas com persistência JSON

### Frontend (Angular)
Interface visual consumindo a API REST:
- Grid de mapa com tokens
- Fichas de personagem
- Painel do GM
- Combat tracker

## Como Rodar

### Desenvolvimento Local

**Backend:**
```bash
cd backend
mvn spring-boot:run
# API disponível em http://localhost:8080
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# App disponível em http://localhost:3000
```

### Docker
```bash
docker-compose up --build
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
```

## API Endpoints

| Endpoint | Descrição |
|----------|-----------|
| `GET /api/compendium/*` | Armas, magias, classes, raças |
| `POST /api/engine/*` | Dice roll, modificadores, AC, HP |
| `POST /api/combat/*` | Ataques, dano, cura, saving throws |
| `GET/POST/PUT/DELETE /api/campaigns` | CRUD de campanhas |
| `POST /api/upload` | Upload de imagens |
