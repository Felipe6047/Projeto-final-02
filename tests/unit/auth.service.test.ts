// tests/unit/auth.service.test.ts
import { mockRepository } from '../helpers/mockDataSource';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../../src/config/database';
import * as authService from '../../src/services/auth.service';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const mockRepo = mockRepository();
(AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);

const fakeUser = {
  id: 1,
  nome: 'Ana Silva',
  email: 'ana@frik.demo',
  senhaHash: '$2b$10$hashedpassword',
  nivelId: 1,
  pontos: 100,
  papel: 'cliente',
  ativo: true,
};

describe('auth.service', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── Login ───────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('A01 - credenciais válidas retornam token e dados do usuário sem senhaHash', async () => {
      mockRepo.findOne.mockResolvedValue(fakeUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('fake.jwt.token');

      const result = await authService.login('ana@frik.demo', 'senha123');

      expect(result).not.toBeNull();
      expect(result?.token).toBe('fake.jwt.token');
      expect(result?.usuario.email).toBe('ana@frik.demo');
      expect(result?.usuario).not.toHaveProperty('senhaHash');
    });

    it('A02 - e-mail inexistente retorna null', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await authService.login('naoexiste@frik.demo', 'senha');

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('A03 - senha incorreta retorna null', async () => {
      mockRepo.findOne.mockResolvedValue(fakeUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.login('ana@frik.demo', 'senhaErrada');

      expect(result).toBeNull();
    });

    it('A04 - usuário inativo retorna null (filtrado na query)', async () => {
      // A query filtra ativo: true, então retorna null para inativos
      mockRepo.findOne.mockResolvedValue(null);

      const result = await authService.login('inativo@frik.demo', 'senha');

      expect(result).toBeNull();
    });

    it('A10 - JWT payload contém id, email e nivelId', async () => {
      mockRepo.findOne.mockResolvedValue(fakeUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token');

      await authService.login('ana@frik.demo', 'senha123');

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, email: 'ana@frik.demo', nivelId: 1 }),
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  // ─── Registro ────────────────────────────────────────────────────────────

  describe('registrar()', () => {
    it('A05 - registro cria usuário com senha hasheada', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('$hashed');
      mockRepo.save.mockResolvedValue({ id: 99 });
      mockRepo.findOne.mockResolvedValue({
        ...fakeUser,
        id: 99,
        email: 'novo@frik.demo',
        senhaHash: '$hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('novo.token');

      const result = await authService.registrar({
        nome: 'Novo',
        email: 'novo@frik.demo',
        senha: 'senha123',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('senha123', 10);
      expect(mockRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ senhaHash: '$hashed' })
      );
      expect(result?.token).toBe('novo.token');
    });

    it('A06 - registro com e-mail duplicado propaga erro do banco', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('$hashed');
      mockRepo.save.mockRejectedValue(
        Object.assign(new Error('ER_DUP_ENTRY'), { code: 'ER_DUP_ENTRY' })
      );

      await expect(
        authService.registrar({ nome: 'X', email: 'ana@frik.demo', senha: '123456' })
      ).rejects.toThrow('ER_DUP_ENTRY');
    });
  });

  // ─── Perfil ───────────────────────────────────────────────────────────────

  describe('buscarPerfil()', () => {
    it('A07 - retorna perfil com dados do nível do usuário', async () => {
      const fakeProfile = {
        id: 1, nome: 'Ana', email: 'ana@frik.demo',
        nivel: 'Bronze', nivel_slug: 'bronze', pontos: 100,
      };
      const qb = mockRepo.createQueryBuilder();
      qb.getRawOne.mockResolvedValue(fakeProfile);

      const result = await authService.buscarPerfil(1);

      expect(result).toEqual(fakeProfile);
    });

    it('A08 - usuário inexistente retorna null', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.getRawOne.mockResolvedValue(undefined);

      const result = await authService.buscarPerfil(9999);

      expect(result).toBeNull();
    });
  });
});
