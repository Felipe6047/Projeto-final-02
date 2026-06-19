import { env } from "../config/env";

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "FRIK API",
    version: "1.0.0",
    description:
      "API REST do **FRIK** — Sistema de Fidelização com Gamificação.\n\n" +
      "Funcionalidades: autenticação JWT, mercado de cupons, trocas, presentes, ranking e catálogo de produtos.\n\n" +
      "**Teste rápido:** faça login em `POST /api/auth/login` e use o botão *Authorize* com o token retornado.",
    contact: {
      name: "FRIK",
    },
  },
  servers: [
    {
      url: `http://localhost:${env.port}/api`,
      description: "Servidor local",
    },
  ],
  tags: [
    { name: "Sistema", description: "Health check" },
    { name: "Auth", description: "Autenticação e perfil do cliente" },
    { name: "Mercado de Cupons", description: "Trocas entre usuários" },
    { name: "Presentes", description: "Cupom e produto físico como presente" },
    { name: "Ranking", description: "Níveis, ranking e gamificação" },
    { name: "Produtos", description: "Catálogo para presentes físicos" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token obtido em POST /auth/login",
      },
    },
    schemas: {
      Erro: {
        type: "object",
        properties: {
          erro: { type: "string", example: "Mensagem de erro" },
          detalhes: { type: "object", additionalProperties: true },
        },
        required: ["erro"],
      },
      LoginRequest: {
        type: "object",
        required: ["email", "senha"],
        properties: {
          email: { type: "string", format: "email", example: "ana@frik.demo" },
          senha: { type: "string", minLength: 6, example: "senha123" },
        },
      },
      RegistroRequest: {
        type: "object",
        required: ["nome", "email", "senha"],
        properties: {
          nome: { type: "string", minLength: 2, example: "João Silva" },
          email: { type: "string", format: "email", example: "joao@email.com" },
          senha: { type: "string", minLength: 6, example: "senha123" },
          telefone: { type: "string", example: "11999998888" },
          cpf: { type: "string", minLength: 11, maxLength: 11, example: "12345678901" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          usuario: {
            type: "object",
            properties: {
              id: { type: "integer" },
              nome: { type: "string" },
              email: { type: "string" },
              nivelId: { type: "integer" },
              pontos: { type: "integer" },
            },
          },
        },
      },
      Perfil: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nome: { type: "string" },
          email: { type: "string" },
          telefone: { type: "string", nullable: true },
          cpf: { type: "string", nullable: true },
          pontos: { type: "integer" },
          avatar_url: { type: "string", nullable: true },
          nivel: { type: "string", example: "Ouro" },
          nivel_slug: { type: "string", example: "ouro" },
          nivel_ordem: { type: "integer" },
        },
      },
      Cupom: {
        type: "object",
        properties: {
          id: { type: "integer" },
          codigo: { type: "string", example: "FRIK-ANA-001" },
          status: {
            type: "string",
            enum: [
              "disponivel",
              "oferecido_troca",
              "em_troca",
              "resgatado",
              "presenteado",
              "expirado",
            ],
          },
          validade_ate: { type: "string", format: "date" },
          titulo: { type: "string" },
          categoria: { type: "string" },
          desconto_percentual: { type: "number", nullable: true },
          valor_minimo_compra: { type: "number", nullable: true },
          proprietario_nome: { type: "string" },
          nivel_slug: { type: "string" },
        },
      },
      MercadoConfig: {
        type: "object",
        properties: {
          diasMinimosValidade: { type: "integer", example: 7 },
          taxaTrocaPontos: { type: "integer", example: 50 },
        },
      },
      SolicitarTrocaRequest: {
        type: "object",
        required: ["cupomSolicitadoId", "cupomOfertadoId"],
        properties: {
          cupomSolicitadoId: { type: "integer", example: 3 },
          cupomOfertadoId: { type: "integer", example: 1 },
          aceitarTaxa: { type: "boolean", default: false },
        },
      },
      ResponderTrocaRequest: {
        type: "object",
        required: ["aceitar"],
        properties: {
          aceitar: { type: "boolean", example: true },
        },
      },
      PropostaTroca: {
        type: "object",
        properties: {
          id: { type: "integer" },
          status: {
            type: "string",
            enum: ["pendente", "aceita", "recusada", "cancelada"],
          },
          taxa_pontos: { type: "integer" },
          criado_em: { type: "string", format: "date-time" },
          respondido_em: { type: "string", format: "date-time", nullable: true },
          cupom_solicitante: { type: "string" },
          cupom_proprietario: { type: "string" },
        },
      },
      PresenteCupomRequest: {
        type: "object",
        required: ["cupomId", "canal"],
        properties: {
          cupomId: { type: "integer", example: 2 },
          canal: {
            type: "string",
            enum: ["email", "whatsapp", "sms", "link"],
          },
          mensagem: { type: "string", maxLength: 200 },
          destinatarioNome: { type: "string" },
          destinatarioEmail: { type: "string", format: "email" },
          destinatarioTelefone: { type: "string" },
          destinatarioCpf: { type: "string", minLength: 11, maxLength: 11 },
        },
      },
      PresenteCupomResponse: {
        type: "object",
        properties: {
          presenteId: { type: "integer" },
          codigoResgate: { type: "string" },
          link: { type: "string", example: "/presentes/cupom/abc123" },
        },
      },
      PresenteProdutoRequest: {
        type: "object",
        required: ["itens", "valorReais", "destinatario", "endereco"],
        properties: {
          itens: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              properties: {
                produtoId: { type: "integer" },
                quantidade: { type: "integer", minimum: 1 },
              },
            },
          },
          pontosUsados: { type: "integer", default: 0 },
          valorReais: { type: "number", example: 0 },
          destinatario: {
            type: "object",
            required: ["nome"],
            properties: {
              nome: { type: "string" },
              email: { type: "string", format: "email" },
              telefone: { type: "string" },
              cpf: { type: "string" },
              usuarioId: { type: "integer" },
            },
          },
          endereco: {
            type: "object",
            example: {
              cep: "01310100",
              logradouro: "Av. Paulista",
              numero: "1000",
              bairro: "Bela Vista",
              cidade: "São Paulo",
              uf: "SP",
            },
          },
          mensagem: { type: "string" },
          embrulho: { type: "boolean" },
          enviarSurpresa: { type: "boolean" },
        },
      },
      PedidoPresente: {
        type: "object",
        properties: {
          id: { type: "integer" },
          destinatario_nome: { type: "string" },
          status: {
            type: "string",
            enum: [
              "pendente",
              "pago",
              "enviado",
              "a_caminho",
              "entregue",
              "cancelado",
            ],
          },
          valor_reais: { type: "number" },
          pontos_usados: { type: "integer" },
          codigo_rastreio: { type: "string", nullable: true },
          criado_em: { type: "string", format: "date-time" },
        },
      },
      NivelBeneficio: {
        type: "object",
        properties: {
          nome: { type: "string", example: "Ouro" },
          slug: { type: "string", example: "ouro" },
          ordem: { type: "integer" },
          trocas_mes: { type: "integer", nullable: true },
          mesmo_rank_apenas: { type: "integer" },
          pode_presentear_cupom: { type: "integer" },
          pode_presentear_produto: { type: "integer" },
          valor_max_presente: { type: "number", nullable: true },
          pode_criar_sala_troca: { type: "integer" },
          pontos_minimos: { type: "integer" },
        },
      },
      RankingItem: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nome: { type: "string" },
          avatar_url: { type: "string", nullable: true },
          nivel: { type: "string" },
          nivel_slug: { type: "string" },
          pontos: { type: "integer" },
          posicao: { type: "integer" },
        },
      },
      MeuNivel: {
        type: "object",
        properties: {
          pontos: { type: "integer" },
          nome: { type: "string" },
          slug: { type: "string" },
          ordem: { type: "integer" },
          pontos_minimos: { type: "integer" },
          proximo_nivel_pontos: { type: "integer", nullable: true },
          progresso_percentual: { type: "integer", example: 65 },
        },
      },
      Conquista: {
        type: "object",
        properties: {
          slug: { type: "string" },
          nome: { type: "string" },
          descricao: { type: "string" },
          icone: { type: "string" },
          desbloqueada_em: { type: "string", format: "date-time" },
        },
      },
      EventoSazonal: {
        type: "object",
        nullable: true,
        properties: {
          id: { type: "integer" },
          titulo: { type: "string" },
          descricao: { type: "string" },
          trocas_extras: { type: "integer" },
          inicio_em: { type: "string", format: "date-time" },
          fim_em: { type: "string", format: "date-time" },
        },
      },
      Produto: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nome: { type: "string" },
          descricao: { type: "string", nullable: true },
          preco_reais: { type: "number" },
          preco_pontos: { type: "integer" },
          estoque: { type: "integer" },
          imagem_url: { type: "string", nullable: true },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: "Token ausente ou inválido",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Erro" },
            example: { erro: "Token não informado" },
          },
        },
      },
      BadRequest: {
        description: "Dados inválidos",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Erro" },
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Sistema"],
        summary: "Health check",
        description: "Verifica se a API está online.",
        responses: {
          "200": {
            description: "API operacional",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    projeto: { type: "string", example: "FRIK API" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        description: "Autentica o cliente e retorna JWT.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login realizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "401": {
            description: "Credenciais inválidas",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Erro" },
              },
            },
          },
        },
      },
    },
    "/auth/registro": {
      post: {
        tags: ["Auth"],
        summary: "Cadastro de cliente",
        description: "Autocadastro. Nível inicial: Bronze.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegistroRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Cliente criado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/auth/perfil": {
      get: {
        tags: ["Auth"],
        summary: "Perfil do usuário logado",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Perfil",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Perfil" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": {
            description: "Usuário não encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Erro" },
              },
            },
          },
        },
      },
    },
    "/mercado-cupons/meus-cupons": {
      get: {
        tags: ["Mercado de Cupons"],
        summary: "Meus cupons",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Lista de cupons do usuário",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Cupom" },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/mercado-cupons": {
      get: {
        tags: ["Mercado de Cupons"],
        summary: "Cupons no mercado",
        description: "Cupons oferecidos por outros usuários (`status = oferecido_troca`).",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "busca",
            in: "query",
            schema: { type: "string" },
            description: "Busca por título ou código",
          },
          {
            name: "categoria",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "valorMinimo",
            in: "query",
            schema: { type: "number" },
          },
        ],
        responses: {
          "200": {
            description: "Lista do mercado",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Cupom" },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/mercado-cupons/config": {
      get: {
        tags: ["Mercado de Cupons"],
        summary: "Configurações do mercado",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Regras de troca",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MercadoConfig" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/mercado-cupons/oferecer/{cupomId}": {
      post: {
        tags: ["Mercado de Cupons"],
        summary: "Oferecer cupom para troca",
        description: "Altera status para `oferecido_troca`. Exige validade > 7 dias.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "cupomId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Cupom publicado no mercado" },
          "400": {
            description: "Regra de negócio violada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Erro" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/mercado-cupons/solicitar-troca": {
      post: {
        tags: ["Mercado de Cupons"],
        summary: "Solicitar troca",
        description:
          "Cria proposta pendente. Valida limite mensal por nível e taxa opcional em pontos.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SolicitarTrocaRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Proposta criada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { propostaId: { type: "integer" } },
                },
              },
            },
          },
          "400": {
            description: "Erro de validação ou limite",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Erro" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/mercado-cupons/propostas/{id}": {
      patch: {
        tags: ["Mercado de Cupons"],
        summary: "Aceitar ou recusar troca",
        description: "Apenas o proprietário do cupom solicitado pode responder.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResponderTrocaRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Proposta respondida",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", enum: ["aceita", "recusada"] },
                  },
                },
              },
            },
          },
          "400": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Erro" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/mercado-cupons/historico": {
      get: {
        tags: ["Mercado de Cupons"],
        summary: "Histórico de trocas",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Propostas do usuário",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/PropostaTroca" },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/presentes/cupom": {
      post: {
        tags: ["Presentes"],
        summary: "Dar cupom de presente",
        description:
          "Quem presenteia não perde pontos — apenas transfere o cupom. Requer nível Prata ou superior.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PresenteCupomRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Presente enviado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PresenteCupomResponse" },
              },
            },
          },
          "400": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Erro" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/presentes/produto": {
      post: {
        tags: ["Presentes"],
        summary: "Comprar produto e enviar como presente",
        description: "Pagamento misto (pontos + reais). Regras por nível (ex.: Ouro até R$ 100).",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PresenteProdutoRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Pedido criado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    pedidoId: { type: "integer" },
                    status: { type: "string", example: "pago" },
                  },
                },
              },
            },
          },
          "400": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Erro" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/presentes/pedidos": {
      get: {
        tags: ["Presentes"],
        summary: "Listar pedidos de presente",
        description: "Pedidos enviados ou recebidos pelo usuário logado.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Lista de pedidos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/PedidoPresente" },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/ranking/beneficios": {
      get: {
        tags: ["Ranking"],
        summary: "Benefícios por nível",
        description: "Tabela Bronze → Diamante com regras de troca e presente.",
        responses: {
          "200": {
            description: "Níveis e benefícios",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/NivelBeneficio" },
                },
              },
            },
          },
        },
      },
    },
    "/ranking/global": {
      get: {
        tags: ["Ranking"],
        summary: "Ranking global",
        parameters: [
          {
            name: "limite",
            in: "query",
            schema: { type: "integer", default: 50 },
          },
        ],
        responses: {
          "200": {
            description: "Ranking por pontos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/RankingItem" },
                },
              },
            },
          },
        },
      },
    },
    "/ranking/evento-ativo": {
      get: {
        tags: ["Ranking"],
        summary: "Evento sazonal ativo",
        responses: {
          "200": {
            description: "Evento ou null",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EventoSazonal" },
              },
            },
          },
        },
      },
    },
    "/ranking/meu-nivel": {
      get: {
        tags: ["Ranking"],
        summary: "Meu nível e progresso",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Nível atual",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MeuNivel" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/ranking/conquistas": {
      get: {
        tags: ["Ranking"],
        summary: "Minhas conquistas (selos)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Conquistas desbloqueadas",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Conquista" },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/produtos": {
      get: {
        tags: ["Produtos"],
        summary: "Listar produtos",
        responses: {
          "200": {
            description: "Catálogo ativo",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Produto" },
                },
              },
            },
          },
        },
      },
    },
    "/produtos/{id}": {
      get: {
        tags: ["Produtos"],
        summary: "Produto por ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Produto encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Produto" },
              },
            },
          },
          "404": {
            description: "Produto não encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Erro" },
              },
            },
          },
        },
      },
    },
  },
} as const;
