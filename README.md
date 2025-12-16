# Polls API

API RESTful de enquetes desenvolvida com **Clean Architecture** e **Domain-Driven Design (DDD)**.

## Tecnologias

- **Runtime:** Bun
- **Framework HTTP:** Fastify
- **ORM:** Drizzle ORM
- **Banco de Dados:** PostgreSQL
- **Autenticação:** JWT
- **Validação:** Zod

## Estrutura do Projeto

src/
├── domain/           # Entidades e regras de negócio
│   └── entities/     # Poll, User, PollAlternative
├── application/      # Casos de uso
│   ├── services/     # AuthService, PollService
│   ├── repositories/ # Interfaces de repositório
│   ├── ports/        # Interfaces (HashProvider, JwtProvider)
│   └── dto/          # Data Transfer Objects
└── infra/            # Implementações concretas
    ├── http/         # Controllers, Routes, Middlewares
    ├── database/     # Schema Drizzle, Connection
    ├── repositories/ # DrizzlePollRepository, etc.
    └── providers/    # BcryptHashProvider, JsonWebTokenProvider
```

##  Configuração

### 1. Clone e instale as dependências

```bash
git clone <repo-url>
cd polls
pnpm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` conforme necessário:

```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=polls
DB_HOST=localhost
DB_PORT=5432
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
JWT_SECRET="sua-chave-secreta"
PORT=3000
```

### 3. Execute as migrações

```bash
pnpm run db:generate
pnpm run db:migrate
```

### 4. Inicie o servidor

```bash
pnpm run dev
```

O servidor estará disponível em `http://localhost:3000`.

---

## Endpoints

### Autenticação

| Método | Rota | Descrição |
| `POST` | `/auth/register` | Registrar usuário |
| `POST` | `/auth/login` | Login (retorna JWT) |

### Enquetes

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/polls` | Criar enquete |
| `GET` | `/polls` | Listar enquetes (com filtros) |
| `GET` | `/polls/:pollId` | Ver detalhes da enquete |
| `POST` | `/polls/:pollId/close` | Encerrar enquete |
| `PATCH` | `/polls/:pollId/extend` | Estender enquete |

**Filtros disponíveis em `GET /polls`:**
- `category` - Filtrar por categoria
- `status` - `open`, `closed`, `scheduled`
- `minVotes`, `maxVotes` - Range de votos
- `createdFrom`, `createdTo` - Range de datas
- `page`, `limit` - Paginação

### Votos

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/polls/:pollId/votes` | Votar em uma opção |
| `GET` | `/polls/:pollId/results` | Ver resultados parciais |

### Histórico do Usuário

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/me/polls/created` | Enquetes criadas pelo usuário |
| `GET` | `/me/polls/voted` | Enquetes em que o usuário votou |


## Autenticação

Todas as rotas (exceto `/auth/*`) requerem autenticação via JWT:


## Desafio Extra Implementado
### Imagens nas Enquetes

As alternativas das enquetes suportam imagens via campo `imageUrl`:

```json
{
  "options": [
    { "text": "Opção 1", "imageUrl": "https://example.com/img1.jpg" },
    { "text": "Opção 2", "imageUrl": "https://example.com/img2.jpg" }
  ]
}
```

## Exemplos de Uso
### Criar Enquete

```bash
curl -X POST http://localhost:3000/polls \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Qual sua linguagem favorita?",
    "description": "Enquete sobre linguagens de programação.",
    "visibility": "public",
    "startAt": "2025-12-01T09:00:00Z",
    "endAt": "2025-12-10T23:59:59Z",
    "categories": ["programming", "tech"],
    "alternatives": [
      { "text": "JavaScript" },
      { "text": "Python" },
      { "text": "Java" }
    ]
  }'
```

### Votar

```bash
curl -X POST http://localhost:3000/polls/<pollId>/votes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "optionId": "<optionId>" }'
```
