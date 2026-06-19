import "reflect-metadata";
import { AppDataSource } from "../config/data-source";
import { NivelFidelidade } from "../entities/NivelFidelidade";
import { Conquista } from "../entities/Conquista";
import { CupomTemplate } from "../entities/CupomTemplate";
import { Produto } from "../entities/Produto";
import { Missao } from "../entities/Missao";
import { Usuario } from "../entities/Usuario";
import { Campanha } from "../entities/Campanha";
import { CupomUsuario } from "../entities/CupomUsuario";
import { EventoSazonal } from "../entities/EventoSazonal";
import { CartaoCredito } from "../entities/CartaoCredito";

async function seed() {
  await AppDataSource.initialize();

  const nivelRepo = AppDataSource.getRepository(NivelFidelidade);
  const countNiveis = await nivelRepo.count();
  if (countNiveis > 0) {
    console.log("Seed já aplicado — nenhuma alteração.");
    await AppDataSource.destroy();
    return;
  }

  await nivelRepo.save([
    {
      nome: "Bronze",
      slug: "bronze",
      ordem: 1,
      trocasMes: 1,
      mesmoRankApenas: true,
      podePresentearCupom: false,
      podePresentearProduto: false,
      valorMaxPresente: null,
      podeCriarSalaTroca: false,
      pontosMinimos: 0,
    },
    {
      nome: "Prata",
      slug: "prata",
      ordem: 2,
      trocasMes: 3,
      mesmoRankApenas: false,
      podePresentearCupom: true,
      podePresentearProduto: false,
      valorMaxPresente: null,
      podeCriarSalaTroca: false,
      pontosMinimos: 500,
    },
    {
      nome: "Ouro",
      slug: "ouro",
      ordem: 3,
      trocasMes: 10,
      mesmoRankApenas: false,
      podePresentearCupom: true,
      podePresentearProduto: true,
      valorMaxPresente: "100.00",
      podeCriarSalaTroca: false,
      pontosMinimos: 2000,
    },
    {
      nome: "Platina",
      slug: "platina",
      ordem: 4,
      trocasMes: null,
      mesmoRankApenas: false,
      podePresentearCupom: true,
      podePresentearProduto: true,
      valorMaxPresente: null,
      podeCriarSalaTroca: true,
      pontosMinimos: 5000,
    },
    {
      nome: "Diamante",
      slug: "diamante",
      ordem: 5,
      trocasMes: null,
      mesmoRankApenas: false,
      podePresentearCupom: true,
      podePresentearProduto: true,
      valorMaxPresente: null,
      podeCriarSalaTroca: true,
      pontosMinimos: 15000,
    },
  ]);

  await AppDataSource.getRepository(Conquista).save([
    {
      slug: "amigo_ouro",
      nome: "Amigo Ouro",
      descricao: "Deu 5 presentes para amigos",
      icone: "star",
    },
    {
      slug: "troca_justa",
      nome: "Troca Justa",
      descricao: "Concluiu 10 trocas aprovadas",
      icone: "handshake",
    },
    {
      slug: "corrente_bem",
      nome: "Corrente do Bem",
      descricao: "Presente gerou nova compra",
      icone: "link",
    },
    {
      slug: "primeira_compra",
      nome: "Iniciante",
      descricao: "Realizou a primeira compra na loja",
      icone: "shopping_cart",
    },
    {
      slug: "fiel_escudeiro",
      nome: "Fiel Escudeiro",
      descricao: "Fez compras por 3 meses consecutivos",
      icone: "workspace_premium",
    },
    {
      slug: "negociador_nato",
      nome: "Negociador Nato",
      descricao: "Conseguiu 50 trocas no mercado",
      icone: "store",
    },
    {
      slug: "aniversario",
      nome: "Feliz Aniversário",
      descricao: "Ganhou bônus no dia do aniversário",
      icone: "cake",
    },
    {
      slug: "rei_das_trocas",
      nome: "Rei das Trocas",
      descricao: "Realizou 25 trocas de cupons com sucesso",
      icone: "swap_horiz",
    },
    {
      slug: "colecionador",
      nome: "Colecionador",
      descricao: "Possui 10 cupons diferentes ao mesmo tempo",
      icone: "collections_bookmark",
    },
    {
      slug: "bem_vindo",
      nome: "Bem-vindo!",
      descricao: "Completou o cadastro e fez o primeiro login",
      icone: "waving_hand",
    },
    {
      slug: "maratonista",
      nome: "Maratonista de Compras",
      descricao: "Registrou compras por 7 semanas seguidas",
      icone: "local_fire_department",
    },
    {
      slug: "generoso",
      nome: "Coração Generoso",
      descricao: "Deu presentes para 3 amigos diferentes",
      icone: "volunteer_activism",
    },
    {
      slug: "expert_mercado",
      nome: "Expert do Mercado",
      descricao: "Vendeu 5 cupons no mercado de trocas",
      icone: "storefront",
    },
    {
      slug: "nivel_ouro",
      nome: "Ouro Puro",
      descricao: "Alcançou o nível Ouro no programa de fidelidade",
      icone: "emoji_events",
    },
    {
      slug: "membro_vip",
      nome: "Membro VIP",
      descricao: "Acumulou mais de 10.000 pontos totais",
      icone: "diamond",
    },
  ]);

  const templates = await AppDataSource.getRepository(CupomTemplate).save([
    {
      titulo: "20% off Eletrônicos",
      descricao: "Desconto em eletrônicos selecionados",
      categoria: "Eletrônicos",
      descontoPercentual: "20.00",
      valorMinimoCompra: "150.00",
      diasValidade: 30,
      ativo: true,
      imagemUrl: "/images/cupons/eletronicos.png",
      precoPontos: 500,
      limitePorUsuario: 2,
    },
    {
      titulo: "R$ 25 de cashback",
      descricao: "Abatimento na próxima compra",
      categoria: "Geral",
      descontoPercentual: null,
      valorMinimoCompra: "80.00",
      diasValidade: 45,
      ativo: true,
      imagemUrl: "/images/cupons/cashback.png",
      precoPontos: 400,
    },
    {
      titulo: "Frete grátis Nacional",
      descricao: "Válido para compras acima de R$ 99",
      categoria: "Frete",
      descontoPercentual: null,
      valorMinimoCompra: "99.00",
      diasValidade: 15,
      ativo: true,
      imagemUrl: "/images/cupons/frete.png",
      precoPontos: 600,
    },
    {
      titulo: "10% off Moda",
      descricao: "Vestuário e acessórios",
      categoria: "Moda",
      descontoPercentual: "10.00",
      valorMinimoCompra: null,
      diasValidade: 30,
      ativo: true,
      imagemUrl: "/images/cupons/moda.png",
      precoPontos: 300,
    },
    {
      titulo: "R$ 50 de cashback VIP",
      descricao: "Apenas para clientes selecionados",
      categoria: "Geral",
      descontoPercentual: null,
      valorMinimoCompra: "200.00",
      diasValidade: 60,
      ativo: true,
      imagemUrl: "/images/cupons/vip.png",
      precoPontos: 1500,
      limiteTotal: 50,
    },
    {
      titulo: "15% off Games",
      descricao: "Jogos e consoles",
      categoria: "Games",
      descontoPercentual: "15.00",
      valorMinimoCompra: "300.00",
      diasValidade: 20,
      ativo: true,
      imagemUrl: "/images/cupons/games.png",
      precoPontos: 800,
    },
    {
      titulo: "Frete expresso grátis",
      descricao: "Entrega em até 2 dias",
      categoria: "Frete",
      descontoPercentual: null,
      valorMinimoCompra: "250.00",
      diasValidade: 10,
      ativo: true,
      imagemUrl: "/images/cupons/frete_expresso.png",
      precoPontos: 1000,
    },
    {
      titulo: "5% off em tudo",
      descricao: "Válido para todo o site",
      categoria: "Geral",
      descontoPercentual: "5.00",
      valorMinimoCompra: null,
      diasValidade: 90,
      ativo: true,
      imagemUrl: "/images/cupons/5off.png",
      precoPontos: 200,
    },
    {
      titulo: "Compre 1 Leve 2 (Acessórios)",
      descricao: "Válido em acessórios selecionados",
      categoria: "Acessórios",
      descontoPercentual: "50.00",
      valorMinimoCompra: "100.00",
      diasValidade: 30,
      ativo: true,
      imagemUrl: "/images/cupons/leve2.png",
      precoPontos: 750,
      limitePorUsuario: 1,
    },
    {
      titulo: "R$ 100 off Smart TVs",
      descricao: "Desconto direto na compra de TVs",
      categoria: "Eletrônicos",
      descontoPercentual: null,
      valorMinimoCompra: "1500.00",
      diasValidade: 15,
      ativo: true,
      imagemUrl: "/images/cupons/tv.png",
      precoPontos: 2500,
      limiteTotal: 20,
    },
  ] as Partial<CupomTemplate>[]);

  await AppDataSource.getRepository(Produto).save([
    {
      nome: "Caneca FRIK",
      descricao: "Caneca personalizada 350ml com logo exclusivo",
      precoReais: "49.90",
      estoque: 50,
      categoria: "Acessórios",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop",
    },
    {
      nome: "Kit Café Especial",
      descricao: "Seleção de cafés premium torrados na hora",
      precoReais: "89.90",
      estoque: 25,
      categoria: "Gastronomia",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
    },
    {
      nome: "Camiseta Edição Ouro",
      descricao: "Camiseta algodão premium edição limitada",
      precoReais: "129.90",
      estoque: 15,
      categoria: "Moda",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    },
    {
      nome: "Fone Bluetooth FRIK",
      descricao: "Fone sem fio com cancelamento de ruído ativo",
      precoReais: "149.90",
      estoque: 30,
      categoria: "Eletrônicos",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    },
    {
      nome: "Smartwatch Sport",
      descricao: "Relógio inteligente com monitor cardíaco e GPS",
      precoReais: "299.90",
      estoque: 10,
      categoria: "Eletrônicos",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    },
    {
      nome: "Mochila FRIK",
      descricao: "Mochila urbana 25L impermeável com porta USB",
      precoReais: "119.90",
      estoque: 40,
      categoria: "Acessórios",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    },
    {
      nome: "Garrafa Térmica 1L",
      descricao: "Mantém frio por 24h e quente por 12h",
      precoReais: "89.00",
      estoque: 20,
      categoria: "Acessórios",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
    },
    {
      nome: "Óculos de Sol Vintage",
      descricao: "Proteção UV400 com estilo retrô exclusivo",
      precoReais: "159.00",
      estoque: 25,
      categoria: "Moda",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
    },
    {
      nome: "Teclado Mecânico RGB",
      descricao: "Switches azuis para digitação e jogos",
      precoReais: "249.90",
      estoque: 15,
      categoria: "Games",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop",
    },
    {
      nome: "Mouse Gamer Sem Fio",
      descricao: "10000 DPI com bateria de longa duração",
      precoReais: "189.90",
      estoque: 30,
      categoria: "Games",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
    },
    {
      nome: "Livro: A Arte da Gamificação",
      descricao: "Guia completo sobre sistemas de engajamento",
      precoReais: "69.50",
      estoque: 50,
      categoria: "Entretenimento",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop",
    },
    {
      nome: "Tênis Urban Runner",
      descricao: "Conforto e estilo para o dia a dia",
      precoReais: "199.90",
      estoque: 20,
      categoria: "Moda",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    },
    {
      nome: "Luminária LED Moderna",
      descricao: "Iluminação ambiente com controle de cor",
      precoReais: "79.90",
      estoque: 10,
      categoria: "Bem-estar",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop",
    },
    {
      nome: "Kit Skincare Premium",
      descricao: "Cuidados com a pele – hidratante + sérum + protetor",
      precoReais: "149.90",
      estoque: 12,
      categoria: "Bem-estar",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop",
    },
    {
      nome: "Jogo de Tabuleiro Estratégico",
      descricao: "Para jogar com a família e amigos",
      precoReais: "220.00",
      estoque: 20,
      categoria: "Entretenimento",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffaed?w=400&h=400&fit=crop",
    },
    {
      nome: "Vale Jantar Bistrô",
      descricao: "Voucher para jantar completo a dois",
      precoReais: "180.00",
      estoque: 5,
      categoria: "Gastronomia",
      ativo: true,
      imagemUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=400&fit=crop",
    },
  ]);

  await AppDataSource.getRepository(Missao).save([
    {
      titulo: "Primeira troca",
      descricao: "Realize sua primeira troca de cupom",
      pontosRecompensa: 100,
      metaValor: 1,
      tipoMeta: "trocas" as const,
      ativa: true,
    },
    {
      titulo: "Presenteie alguém",
      descricao: "Envie um cupom de presente",
      pontosRecompensa: 150,
      metaValor: 1,
      tipoMeta: "presentes" as const,
      ativa: true,
    },
    {
      titulo: "Cliente Ouro",
      descricao: "Acumule 1000 pontos em compras",
      pontosRecompensa: 200,
      metaValor: 1000,
      tipoMeta: "pontos" as const,
      ativa: true,
    },
    {
      titulo: "Mestre das Trocas",
      descricao: "Realize 10 trocas de cupons",
      pontosRecompensa: 500,
      metaValor: 10,
      tipoMeta: "trocas" as const,
      ativa: true,
    },
    {
      titulo: "Cliente Frequente",
      descricao: "Faça 5 compras em um mês",
      pontosRecompensa: 300,
      metaValor: 5,
      tipoMeta: "compras" as const,
      ativa: true,
    },
    {
      titulo: "Primeira Troca",
      descricao: "Realize sua primeira troca de cupom",
      pontosRecompensa: 100,
      metaValor: 1,
      tipoMeta: "trocas" as const,
      ativa: true,
    },
    {
      titulo: "Comprador Assíduo",
      descricao: "Registre 10 compras na plataforma",
      pontosRecompensa: 400,
      metaValor: 10,
      tipoMeta: "compras" as const,
      ativa: true,
    },
    {
      titulo: "Grande Acumulador",
      descricao: "Acumule 3.000 pontos no total",
      pontosRecompensa: 300,
      metaValor: 3000,
      tipoMeta: "pontos" as const,
      ativa: true,
    },
    {
      titulo: "Rei da Generosidade",
      descricao: "Presenteie 3 amigos com cupons ou produtos",
      pontosRecompensa: 500,
      metaValor: 3,
      tipoMeta: "presentes" as const,
      ativa: true,
    },
    {
      titulo: "Negociante Experiente",
      descricao: "Realize 5 trocas no mercado de cupons",
      pontosRecompensa: 350,
      metaValor: 5,
      tipoMeta: "trocas" as const,
      ativa: true,
    },
  ]);

  const senhaHash =
    "$2b$10$/UGd4aICWq8pRbItFREnYufRhToMw5LydAu8O5nnO5wwxVV2sy1Ma"; // senha123

  const usuarios = await AppDataSource.getRepository(Usuario).save([
    {
      nome: "Ana Silva",
      email: "ana@frik.demo",
      telefone: "11999990001",
      cpf: "49280983156",
      senhaHash,
      nivelId: 3,
      pontos: 2500,
      papel: "cliente",
      ativo: true,
    },
    {
      nome: "Bruno Costa",
      email: "bruno@frik.demo",
      telefone: "11999990002",
      cpf: "94816220100",
      senhaHash,
      nivelId: 2,
      pontos: 800,
      papel: "cliente",
      ativo: true,
    },
    {
      nome: "Carla Mendes",
      email: "carla@frik.demo",
      telefone: "11999990003",
      cpf: "56064850108",
      senhaHash,
      nivelId: 1,
      pontos: 120,
      papel: "cliente",
      ativo: true,
    },
    {
      nome: "Admin FRIK",
      email: "admin@frik.demo",
      telefone: "11999990000",
      cpf: "66393865180",
      senhaHash,
      nivelId: 5,
      pontos: 0,
      papel: "admin",
      ativo: true,
    },
  ]);

  const inicio = new Date();
  inicio.setDate(inicio.getDate() - 1);
  const fimCampanha = new Date();
  fimCampanha.setDate(fimCampanha.getDate() + 30);

  await AppDataSource.getRepository(Campanha).save({
    titulo: "Boas-vindas Bronze",
    descricao: "Bônus para novos membros nível Bronze",
    segmentoJson: { nivel_slug: ["bronze"] },
    inicioEm: inicio,
    fimEm: fimCampanha,
    ativa: true,
  });

  const validade25 = new Date();
  validade25.setDate(validade25.getDate() + 25);
  const validade40 = new Date();
  validade40.setDate(validade40.getDate() + 40);
  const validade20 = new Date();
  validade20.setDate(validade20.getDate() + 20);
  const validade10 = new Date();
  validade10.setDate(validade10.getDate() + 10);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  await AppDataSource.getRepository(CupomUsuario).save([
    {
      usuarioId: usuarios[0].id,
      templateId: templates[0].id,
      codigo: "FRIK-ANA-001",
      status: "disponivel",
      validadeAte: fmt(validade25),
      origem: "compra",
    },
    {
      usuarioId: usuarios[0].id,
      templateId: templates[1].id,
      codigo: "FRIK-ANA-002",
      status: "disponivel",
      validadeAte: fmt(validade40),
      origem: "missao",
    },
    {
      usuarioId: usuarios[1].id,
      templateId: templates[0].id,
      codigo: "FRIK-BRU-001",
      status: "oferecido_troca",
      validadeAte: fmt(validade20),
      origem: "compra",
    },
    {
      usuarioId: usuarios[2].id,
      templateId: templates[2].id,
      codigo: "FRIK-CAR-001",
      status: "disponivel",
      validadeAte: fmt(validade10),
      origem: "campanha",
    },
  ]);

  const fimEvento = new Date();
  fimEvento.setDate(fimEvento.getDate() + 7);

  await AppDataSource.getRepository(EventoSazonal).save({
    titulo: "Semana do Troca-Troca",
    descricao: "+2 trocas extras para todos os níveis!",
    trocasExtras: 2,
    inicioEm: new Date(),
    fimEm: fimEvento,
    ativo: true,
  });

  await AppDataSource.getRepository(CartaoCredito).save([
    {
      usuarioId: 1, // Ana
      apelido: "Meu Cartão (Mastercard)",
      numero: "5582951614393600",
      nomeTitular: "ANA SILVA",
      validade: "02/27",
      cvv: "945",
      principal: true,
    },
    {
      usuarioId: 2, // Bruno
      apelido: "Cartão Visa",
      numero: "4539579713773567",
      nomeTitular: "BRUNO COSTA",
      validade: "06/28",
      cvv: "696",
      principal: true,
    },
    {
      usuarioId: 3, // Carla
      apelido: "Master Principal",
      numero: "5290030760984091",
      nomeTitular: "CARLA MENDES",
      validade: "02/27",
      cvv: "112",
      principal: true,
    },
    {
      usuarioId: 4, // Admin
      apelido: "Cartão Business",
      numero: "5108666834191510",
      nomeTitular: "ADMIN FRIK",
      validade: "12/27",
      cvv: "900",
      principal: true,
    },
  ]);

  console.log("Seed aplicado com sucesso.");
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
