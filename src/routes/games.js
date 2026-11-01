async function gameRoutes(fastify, options) {
  const gamesCollection = fastify.mongo.db.collection("games");
  const { ObjectId } = fastify.mongo;

  const gameResponseSchema = {
    type: "object",
    properties: {
      _id: { type: "string", examples: ["6650a2b8e391b1f9b33a1012"] },
      title: { type: "string", examples: ["Call of Duty Modern Warfare 4"] },
      slug: { type: "string", examples: ["cod-mw4"] },
      genre: { type: "string", examples: ["Shooter"] },
      rating: { type: "number", examples: [8] },
      createdAt: { type: "string", format: "date-time" },
    },
  };

  fastify.get(
    "/games",
    {
      schema: {
        tags: ["Games"],
        summary: "Listar todos os jogos",
        description:
          "Retorna a lista paginada de jogos cadastrados com filtro opcional por gênero",
        queryString: {
          type: "object",
          properties: {
            limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            page: { type: "integer", minimum: 1, default: 1 },
            genre: { type: "string" },
          },
        },
        response: {
          200: {
            description: "Lista de jogos retornada com sucesso",
            type: "array",
            items: gameResponseSchema,
          },
        },
      },
    },
    async (request, reply) => {
      const { limit = 20, page = 1, genre } = request.query;
      const filter = genre ? { genre } : {};
      const skip = (page - 1) * limit;

      return await gamesCollection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
    },
  );

  fastify.post(
    "/games",
    {
      schema: {
        tags: ["Games"],
        summary: "Criar um novo jogo",
        description: "Cadastra um novo jogo no acervo da API.",
        body: {
          type: "object",
          required: ["title", "slug", "genre", "rating"],
          properties: {
            title: { type: "string", examples: ["Celeste"] },
            slug: { type: "string", examples: ["celeste"] },
            genre: { type: "string", examples: ["Platformer"] },
            rating: { type: "number", examples: [10] },
          },
        },
        response: {
          201: {
            description: "Jogo criado com sucesso",
            ...gameResponseSchema,
          },
        },
      },
    },
    async (request, reply) => {
      const { title, slug, genre, rating } = request.body;

      const newGame = {
        title,
        slug,
        genre,
        rating,
        createdAt: new Date(),
      };

      const result = await gamesCollection.insertOne(newGame);

      return reply.code(201).send({
        id: result.insertedId,
        ...newGame,
      });
    },
  );

  fastify.get(
    "/games/:id",
    {
      schema: {
        tags: ["Games"],
        summary: "Buscar jogo por ID",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description: "Hexadecimal ObjectId do MongoDB",
            },
          },
        },
        response: {
          200: gameResponseSchema,
          400: {
            type: "object",
            properties: { error: { type: "string" } },
          },
          404: {
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      if (!ObjectId.isValid(id)) {
        return reply.code(400).send({ error: "ID inválido" });
      }

      const game = await gamesCollection.findOne({ _id: new ObjectId(id) });
      if (!game) {
        return reply.code(404).send({ error: "Jogo não encontrado" });
      }

      return game;
    },
  );
}

module.exports = gameRoutes;
