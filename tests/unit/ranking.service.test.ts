// tests/unit/ranking.service.test.ts
import { mockRepository } from '../helpers/mockDataSource';
import { AppDataSource } from '../../src/config/database';
import * as rankingService from '../../src/services/ranking.service';

const mockRepo = mockRepository();
(AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);
(AppDataSource.query as jest.Mock).mockResolvedValue([]);

describe('ranking.service', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── meuNivel ─────────────────────────────────────────────────────────────

  describe('meuNivel()', () => {
    it('R01 - calcula progresso percentual corretamente entre níveis', async () => {
      // pontos=1000, minimo=500, proximo=2000 → ((1000-500)/(2000-500))*100 ≈ 33%
      const qb = mockRepo.createQueryBuilder();
      qb.getRawOne.mockResolvedValue({
        pontos: 1000,
        nome: 'Prata',
        slug: 'prata',
        ordem: 2,
        pontos_minimos: 500,
        proximo_nivel_pontos: 2000,
      });

      const result = await rankingService.meuNivel(1);

      expect(result?.progresso_percentual).toBe(33);
    });

    it('R02 - nível máximo (Diamante) retorna progresso 100%', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.getRawOne.mockResolvedValue({
        pontos: 20000,
        nome: 'Diamante',
        slug: 'diamante',
        ordem: 5,
        pontos_minimos: 15000,
        proximo_nivel_pontos: null, // sem próximo nível
      });

      const result = await rankingService.meuNivel(1);

      expect(result?.progresso_percentual).toBe(100);
    });

    it('R03 - progresso nunca ultrapassa 100% mesmo com excesso de pontos', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.getRawOne.mockResolvedValue({
        pontos: 9999,
        nome: 'Prata',
        slug: 'prata',
        ordem: 2,
        pontos_minimos: 500,
        proximo_nivel_pontos: 2000, // já ultrapassou, mas ainda não subiu
      });

      const result = await rankingService.meuNivel(1);

      expect(result?.progresso_percentual).toBeLessThanOrEqual(100);
    });

    it('R04 - usuário inexistente retorna null', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.getRawOne.mockResolvedValue(undefined);

      const result = await rankingService.meuNivel(9999);

      expect(result).toBeNull();
    });
  });

  // ─── rankingGlobal ────────────────────────────────────────────────────────

  describe('rankingGlobal()', () => {
    it('R05 - retorna lista de usuários do ranking', async () => {
      const fakeRanking = [
        { id: 1, nome: 'Ana', pontos: 2500, nivel: 'Ouro', posicao: 1 },
        { id: 2, nome: 'Bruno', pontos: 800, nivel: 'Prata', posicao: 2 },
      ];
      (AppDataSource.query as jest.Mock).mockResolvedValue(fakeRanking);

      const result = await rankingService.rankingGlobal(50);

      expect(result).toHaveLength(2);
      expect(result[0].posicao).toBe(1);
    });

    it('R06 - passa o parâmetro limite corretamente para a query', async () => {
      (AppDataSource.query as jest.Mock).mockResolvedValue([]);

      await rankingService.rankingGlobal(5);

      expect(AppDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT'),
        [5]
      );
    });
  });

  // ─── eventoAtivo ──────────────────────────────────────────────────────────

  describe('eventoAtivo()', () => {
    it('R07 - retorna null quando não há evento ativo', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.getOne.mockResolvedValue(null);

      const result = await rankingService.eventoAtivo();

      expect(result).toBeNull();
    });

    it('R08 - retorna evento quando dentro do período ativo', async () => {
      const fakeEvento = {
        id: 1,
        titulo: 'Semana do Troca-Troca',
        trocasExtras: 2,
        ativo: true,
      };
      const qb = mockRepo.createQueryBuilder();
      qb.getOne.mockResolvedValue(fakeEvento);

      const result = await rankingService.eventoAtivo();

      expect(result).not.toBeNull();
      expect(result?.trocasExtras).toBe(2);
    });
  });

  // ─── beneficiosPorNivel ───────────────────────────────────────────────────

  describe('beneficiosPorNivel()', () => {
    it('R09 - retorna 5 níveis ordenados por ordem ASC', async () => {
      const fakeNiveis = [
        { nome: 'Bronze', slug: 'bronze', ordem: 1 },
        { nome: 'Prata', slug: 'prata', ordem: 2 },
        { nome: 'Ouro', slug: 'ouro', ordem: 3 },
        { nome: 'Platina', slug: 'platina', ordem: 4 },
        { nome: 'Diamante', slug: 'diamante', ordem: 5 },
      ];
      const qb = mockRepo.createQueryBuilder();
      qb.getRawMany.mockResolvedValue(fakeNiveis);

      const result = await rankingService.beneficiosPorNivel();

      expect(result).toHaveLength(5);
      expect(result[0].slug).toBe('bronze');
      expect(result[4].slug).toBe('diamante');
    });
  });
});
