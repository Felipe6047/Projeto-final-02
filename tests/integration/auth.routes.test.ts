// tests/integration/auth.routes.test.ts
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { buildTestApp } from '../helpers/testApp';
import * as authService from '../../src/services/auth.service';

jest.mock('../../src/services/auth.service');
jest.mock('../../src/config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
    query: jest.fn(),
    transaction: jest.fn(),
    initialize: jest.fn(),
    destroy: jest.fn(),
  },
}));

const app = buildTestApp();

// Token válido para testes autenticados
const validToken = jwt.sign(
  { id: 1, email: 'ana@frik.demo', nivelId: 1, papel: 'cliente' },
  process.env.JWT_SECRET ?? 'frik_secret_test',
  { expiresIn: '1h' }
);

describe('POST /api/auth/login', () => {
  it('AR01 - credenciais válidas retornam 200 com token', async () => {
    (authService.login as jest.Mock).mockResolvedValue({
      token: 'jwt.token.here',
      usuario: { id: 1, nome: 'Ana', email: 'ana@frik.demo', nivelId: 1, pontos: 100 },
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@frik.demo', senha: 'senha123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token', 'jwt.token.here');
    expect(res.body.usuario).not.toHaveProperty('senhaHash');
  });

  it('AR02 - senha incorreta retorna 401', async () => {
    (authService.login as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@frik.demo', senha: 'senhaErrada' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('erro');
  });

  it('AR03 - body sem campo email retorna 400 com detalhes de validação', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ senha: 'senha123' }); // sem email

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('detalhes');
  });

  it('AR04 - body sem campo senha retorna 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@frik.demo' }); // sem senha

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('detalhes');
  });

  it('AR05b - email com formato inválido retorna 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nao-e-email', senha: 'senha123' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/registro', () => {
  it('AR05 - dados válidos criam usuário e retornam 201 com token', async () => {
    (authService.registrar as jest.Mock).mockResolvedValue({
      token: 'novo.token',
      usuario: { id: 99, nome: 'Novo', email: 'novo@frik.demo', nivelId: 1, pontos: 0 },
    });

    const res = await request(app)
      .post('/api/auth/registro')
      .send({ nome: 'Novo', email: 'novo@frik.demo', senha: 'senha123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  it('AR06 - email inválido retorna 400', async () => {
    const res = await request(app)
      .post('/api/auth/registro')
      .send({ nome: 'X', email: 'nao-e-email', senha: 'senha123' });

    expect(res.status).toBe(400);
  });

  it('AR07 - senha com menos de 6 caracteres retorna 400', async () => {
    const res = await request(app)
      .post('/api/auth/registro')
      .send({ nome: 'X', email: 'x@frik.demo', senha: '123' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/perfil', () => {
  it('AR08 - sem token retorna 401', async () => {
    const res = await request(app).get('/api/auth/perfil');
    expect(res.status).toBe(401);
  });

  it('AR09 - token válido retorna dados do perfil', async () => {
    (authService.buscarPerfil as jest.Mock).mockResolvedValue({
      id: 1, nome: 'Ana', email: 'ana@frik.demo', nivel: 'Bronze', pontos: 100,
    });

    const res = await request(app)
      .get('/api/auth/perfil')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('nome', 'Ana');
  });

  it('AR10 - token com assinatura inválida retorna 401', async () => {
    const res = await request(app)
      .get('/api/auth/perfil')
      .set('Authorization', 'Bearer token.invalido.aqui');

    expect(res.status).toBe(401);
  });
});
