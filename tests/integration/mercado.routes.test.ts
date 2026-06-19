// tests/integration/mercado.routes.test.ts
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { buildTestApp } from '../helpers/testApp';
import * as cupomService from '../../src/services/cupom.service';

jest.mock('../../src/services/cupom.service');
jest.mock('../../src/config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
    query: jest.fn(),
    transaction: jest.fn(),
  },
}));

const app = buildTestApp();

const validToken = jwt.sign(
  { id: 1, email: 'ana@frik.demo', nivelId: 2, papel: 'cliente' },
  process.env.JWT_SECRET ?? 'frik_secret_test',
  { expiresIn: '1h' }
);

const authHeader = { Authorization: `Bearer ${validToken}` };

describe('GET /api/mercado-cupons/meus-cupons', () => {
  it('MR01 - sem token retorna 401', async () => {
    const res = await request(app).get('/api/mercado-cupons/meus-cupons');
    expect(res.status).toBe(401);
  });

  it('MR02 - token válido retorna lista de cupons do usuário', async () => {
    (cupomService.listarMeusCupons as jest.Mock).mockResolvedValue([
      { id: '1', codigo: 'FRIK-001', status: 'disponivel', titulo: '20% off' },
    ]);

    const res = await request(app)
      .get('/api/mercado-cupons/meus-cupons')
      .set(authHeader);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('codigo', 'FRIK-001');
  });
});

describe('GET /api/mercado-cupons', () => {
  it('MR03 - rota protegida sem token retorna 401', async () => {
    (cupomService.listarMercado as jest.Mock).mockResolvedValue([
      { id: '2', codigo: 'FRIK-002', titulo: 'Frete Grátis' },
    ]);

    const res = await request(app).get('/api/mercado-cupons');

    expect(res.status).toBe(401);
  });
});

describe('POST /api/mercado-cupons/oferecer/:id', () => {
  it('MR04 - cupom válido retorna 200 com ok: true', async () => {
    (cupomService.oferecerParaTroca as jest.Mock).mockResolvedValue({ ok: true });

    const res = await request(app)
      .post('/api/mercado-cupons/oferecer/1')
      .set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  it('MR05 - cupom com validade curta retorna 400 com mensagem de erro', async () => {
    (cupomService.oferecerParaTroca as jest.Mock).mockResolvedValue({
      erro: 'Cupom precisa ter validade maior que 7 dias',
    });

    const res = await request(app)
      .post('/api/mercado-cupons/oferecer/1')
      .set(authHeader);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('erro');
  });

  it('MR01b - sem token em oferecer retorna 401', async () => {
    const res = await request(app).post('/api/mercado-cupons/oferecer/1');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/mercado-cupons/solicitar-troca', () => {
  it('MR06 - body inválido retorna 400 Zod', async () => {
    const res = await request(app)
      .post('/api/mercado-cupons/solicitar-troca')
      .set(authHeader)
      .send({}); // sem campos obrigatórios

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('detalhes');
  });

  it('MR07 - limite mensal atingido retorna 400', async () => {
    (cupomService.solicitarTroca as jest.Mock).mockResolvedValue({
      erro: 'Limite mensal de trocas atingido para seu nível',
    });

    const res = await request(app)
      .post('/api/mercado-cupons/solicitar-troca')
      .set(authHeader)
      .send({ cupomSolicitadoId: 10, cupomOfertadoId: 20, aceitarTaxa: false });

    expect(res.status).toBe(400);
    expect(res.body.erro).toMatch(/Limite mensal/i);
  });

  it('MR08 - pontos insuficientes retorna 400', async () => {
    (cupomService.solicitarTroca as jest.Mock).mockResolvedValue({
      erro: 'Pontos insuficientes para taxa de troca',
    });

    const res = await request(app)
      .post('/api/mercado-cupons/solicitar-troca')
      .set(authHeader)
      .send({ cupomSolicitadoId: 10, cupomOfertadoId: 20, aceitarTaxa: true });

    expect(res.status).toBe(400);
    expect(res.body.erro).toMatch(/Pontos insuficientes/i);
  });
});

describe('PATCH /api/mercado-cupons/propostas/:id', () => {
  it('MR09 - aceitar troca retorna 200 com status aceita', async () => {
    (cupomService.responderTroca as jest.Mock).mockResolvedValue({ status: 'aceita' });

    const res = await request(app)
      .patch('/api/mercado-cupons/propostas/1')
      .set(authHeader)
      .send({ aceitar: true });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'aceita');
  });

  it('MR10 - recusar troca retorna 200 com status recusada', async () => {
    (cupomService.responderTroca as jest.Mock).mockResolvedValue({ status: 'recusada' });

    const res = await request(app)
      .patch('/api/mercado-cupons/propostas/1')
      .set(authHeader)
      .send({ aceitar: false });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'recusada');
  });
});
