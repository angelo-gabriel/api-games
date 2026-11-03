# Games API

API REST para cadastro e consulta de jogos. O projeto utiliza Node.js,
Fastify e MongoDB, com documentação interativa gerada pelo Swagger/OpenAPI.

## Tecnologias

- Node.js
- Fastify
- MongoDB
- `@fastify/mongodb`
- Swagger/OpenAPI
- Biome (dependência de desenvolvimento)

## Funcionamento

Ao iniciar, o servidor:

1. Registra o plugin do Swagger e prepara a documentação da API.
2. Conecta ao MongoDB.
3. Cria um índice único para o campo `slug` na coleção `games`.
4. Registra as rotas com o prefixo `/api/v1`.
5. Escuta na porta `3333`, em todas as interfaces (`0.0.0.0`).

Os jogos são armazenados no banco `api_games`, na coleção `games`. Cada
registro possui:

```json
{
  "_id": "6650a2b8e391b1f9b33a1012",
  "title": "Celeste",
  "slug": "celeste",
  "genre": "Platformer",
  "rating": 10,
  "createdAt": "2026-11-01T12:00:00.000Z"
}
```

## Pré-requisitos

- Node.js instalado (recomenda-se uma versão LTS recente).
- MongoDB instalado e em execução localmente.
- Acesso ao MongoDB na porta `27017`.

Por padrão, a conexão está configurada em
`src/plugins/mongo.js`. Se o MongoDB usar outro host, porta, usuário ou
senha, ajuste a URL de conexão nesse arquivo antes de iniciar a aplicação.

## Instalação

Clone ou copie o projeto e entre no diretório:

```bash
cd api-games
```

Instale as dependências:

```bash
npm install
```

O comando instala as dependências descritas em `package.json` e também
cria ou atualiza o `package-lock.json`.

## Como executar

Inicie o servidor em modo de desenvolvimento:

```bash
npm run dev
```

Esse comando executa `node --watch src/server.js`, reiniciando o servidor
automaticamente quando os arquivos JavaScript forem alterados.

Quando a aplicação estiver em execução, os endereços principais serão:

- API: <http://localhost:3333>
- Documentação Swagger: <http://localhost:3333/docs>

Se a porta `3333` estiver ocupada por outro serviço, defina outra porta
pela variável de ambiente `PORT`.

Para encerrar, pressione `Ctrl+C`. O servidor trata os sinais `SIGINT` e
`SIGTERM` e fecha a conexão da aplicação antes de sair.

## Endpoints

### Listar jogos

```http
GET /api/v1/games
```

Parâmetros de consulta opcionais:

- `limit`: quantidade de resultados, entre `1` e `100`; padrão `20`.
- `page`: página a ser retornada; padrão `1`.
- `genre`: filtra os jogos por gênero.

Exemplo:

```bash
curl "http://localhost:3333/api/v1/games?limit=10&page=1&genre=RPG"
```

Os resultados são ordenados do mais recente para o mais antigo, usando
`createdAt`.

### Criar jogo

```http
POST /api/v1/games
Content-Type: application/json
```

Corpo obrigatório:

```json
{
  "title": "Celeste",
  "slug": "celeste",
  "genre": "Platformer",
  "rating": 10
}
```

Exemplo:

```bash
curl -X POST "http://localhost:3333/api/v1/games" ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Celeste\",\"slug\":\"celeste\",\"genre\":\"Platformer\",\"rating\":10}"
```

A resposta bem-sucedida possui status `201` e inclui o identificador
gerado pelo MongoDB e a data de criação:

```json
{
  "id": "6650a2b8e391b1f9b33a1012",
  "title": "Celeste",
  "slug": "celeste",
  "genre": "Platformer",
  "rating": 10,
  "createdAt": "2026-11-01T12:00:00.000Z"
}
```

O campo `slug` deve ser único. Tentativas de cadastrar um slug já
existente serão rejeitadas pelo índice único do MongoDB.

### Buscar jogo por ID

```http
GET /api/v1/games/:id
```

Exemplo:

```bash
curl "http://localhost:3333/api/v1/games/6650a2b8e391b1f9b33a1012"
```

Possíveis respostas de erro:

- `400`: o ID informado não é um `ObjectId` hexadecimal válido.
- `404`: não existe jogo com o ID informado.

### Atualizar jogo

```http
PUT /api/v1/games/:id
Content-Type: application/json
```

O corpo deve informar `title`, `slug`, `genre` e `rating`. O campo
`createdAt` é preservado durante a atualização.

Possíveis respostas de erro:

- `400`: o ID informado não é um `ObjectId` hexadecimal válido.
- `404`: não existe jogo com o ID informado.

### Excluir jogo

```http
DELETE /api/v1/games/:id
```

A operação retorna `204` quando o jogo é excluído. Também pode retornar
`400` para um ID inválido ou `404` quando o jogo não existe.

## Documentação da API

Com o servidor em execução, acesse
<http://localhost:3333/docs> para visualizar e testar os endpoints pela
interface do Swagger UI.

## Estrutura do projeto

```text
src/
├── server.js            # Inicialização do Fastify e registro dos plugins
├── plugins/
│   ├── mongo.js         # Conexão com MongoDB e índice de slug
│   └── swagger.js       # Configuração do OpenAPI e Swagger UI
└── routes/
    └── games.js         # Rotas e operações de jogos
```

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm install` | Instala as dependências |
| `npm run dev` | Executa o servidor com recarregamento automático |
| `npm test` | Ainda não há testes configurados |

## Solução de problemas

### Erro de conexão com o MongoDB

Verifique se o serviço do MongoDB está em execução e se a URL configurada
em `src/plugins/mongo.js` corresponde ao ambiente local. Confirme também
se o banco está acessível na porta `27017`.

### Porta `3333` ocupada

Encerre o processo que está utilizando a porta ou altere a porta no
`app.listen` em `src/server.js`.

### Dependências não encontradas

Remova `node_modules` e reinstale as dependências:

```bash
Remove-Item -Recurse -Force node_modules
npm install
```
