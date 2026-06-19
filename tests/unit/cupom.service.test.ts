// tests/unit/cupom.service.test.ts
import { mockRepository } from '../helpers/mockDataSource';
import { AppDataSource } from '../../src/config/database';
import * as cupomService from '../../src/services/cupom.service';

jest.mock('../../src/services/gamificacao.service', () => ({
  criarNotificacao: jest.fn(),
  incrementarMissao: jest.fn(),
  verificarConquistas: jest.fn(),
}));

jest.mock('../../src/config/env', () => ({
  env: { taxaTrocaPontos: 50 },
}));

const mockRepo = mockRepository();
const mockManager = {
  getRepository: jest.fn().mockReturnValue(mockRepo),
};

(AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);
(AppDataSource.transaction as jest.Mock).mockImplementation(
  async (cb: (m: typeof mockManager) => unknown) => cb(mockManager)
);

const futureDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

describe('cupom.service', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── oferecerParaTroca ────────────────────────────────────────────────────

  describe('oferecerParaTroca()', () => {
    it('C01 - cupom válido muda status para oferecido_troca', async () => {
      mockRepo.findOne.mockResolvedValue({
        id: '1', usuarioId: 1, status: 'disponivel',
        validadeAte: futureDate(30),
      });
      mockRepo.save.mockResolvedValue({});

      const result = await cupomService.oferecerParaTroca(1, 1);

      expect(result).toEqual({ ok: true });
      expect(mockRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'oferecido_troca' })
      );
    });

    it('C02 - cupom de outro usuário retorna erro', async () => {
      mockRepo.findOne.mockResolvedValue(null); // query filtra usuarioId

      const result = await cupomService.oferecerParaTroca(1, 99);

      expect(result).toHaveProperty('erro');
      expect((result as { erro: string }).erro).toMatch(/não encontrado/i);
    });

    it('C03 - cupom com validade <= 7 dias retorna erro', async () => {
      mockRepo.findOne.mockResolvedValue({
        id: '1', usuarioId: 1, status: 'disponivel',
        validadeAte: futureDate(5), // apenas 5 dias
      });

      const result = await cupomService.oferecerParaTroca(1, 1);

      expect(result).toHaveProperty('erro');
      expect((result as { erro: string }).erro).toMatch(/7 dias/i);
    });

    it('C04 - cupom com status diferente de disponivel retorna erro', async () => {
      mockRepo.findOne.mockResolvedValue({
        id: '1', usuarioId: 1, status: 'em_troca',
        validadeAte: futureDate(30),
      });

      const result = await cupomService.oferecerParaTroca(1, 1);

      expect(result).toHaveProperty('erro');
      expect((result as { erro: string }).erro).toMatch(/disponível/i);
    });
  });

  // ─── solicitarTroca ───────────────────────────────────────────────────────

  describe('solicitarTroca()', () => {
    const buildCupomAlvo = (usuarioId = 2) => ({
      id: '10', usuarioId, status: 'oferecido_troca',
      usuario: { id: usuarioId },
    });

    const buildMeuCupom = () => ({
      id: '20', usuarioId: 1, status: 'disponivel',
    });

    it('C05 - não pode solicitar troca com cupom próprio', async () => {
      // cupomAlvo pertence ao solicitante (usuarioId === 1)
      const qb = mockRepo.createQueryBuilder();
      qb.getOne.mockResolvedValue(buildCupomAlvo(1)); // mesmo usuário!

      const result = await cupomService.solicitarTroca({
        solicitanteId: 1,
        cupomSolicitadoId: 10,
        cupomOfertadoId: 20,
        aceitarTaxa: false,
      });

      expect(result).toHaveProperty('erro');
      expect((result as { erro: string }).erro).toMatch(/próprio/i);
    });

    it('C07 - pontos insuficientes para taxa retorna erro', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.getOne.mockResolvedValue(buildCupomAlvo(2));
      mockRepo.findOne
        .mockResolvedValueOnce(buildMeuCupom()) // meuCupom
        // verificarLimiteTrocas queries:
        .mockResolvedValueOnce(null); // uso mensal (sem registro)

      // nivel sem limite (null = ilimitado)
      const qb2 = mockRepo.createQueryBuilder();
      qb2.getRawOne
        .mockResolvedValueOnce({ trocas_mes: null }) // nível ilimitado
        .mockResolvedValueOnce({ extras: '0' }); // sem evento

      // usuario com pontos insuficientes (30 < 50 de taxa)
      mockRepo.findOne.mockResolvedValue({ id: 1, pontos: 30 });

      const result = await cupomService.solicitarTroca({
        solicitanteId: 1,
        cupomSolicitadoId: 10,
        cupomOfertadoId: 20,
        aceitarTaxa: true,
      });

      expect(result).toHaveProperty('erro');
      expect((result as { erro: string }).erro).toMatch(/Pontos insuficientes/i);
    });
  });

  // ─── responderTroca ───────────────────────────────────────────────────────

  describe('responderTroca()', () => {
    it('C10 - recusar troca restaura status dos cupons', async () => {
      mockRepo.findOne.mockResolvedValue({
        id: '1', solicitanteId: 1, proprietarioId: 2,
        cupomSolicitanteId: '10', cupomProprietarioId: '20',
        status: 'pendente',
      });
      mockRepo.save.mockResolvedValue({});
      mockRepo.update.mockResolvedValue({});

      const result = await cupomService.responderTroca(2, 1, false);

      expect(result).toEqual({ status: 'recusada' });
      // Cupom do solicitante volta para disponivel
      expect(mockRepo.update).toHaveBeenCalledWith(
        { id: '10' }, { status: 'disponivel' }
      );
      // Cupom do proprietário volta para oferecido_troca
      expect(mockRepo.update).toHaveBeenCalledWith(
        { id: '20' }, { status: 'oferecido_troca' }
      );
    });

    it('C11 - proposta de outro usuário retorna erro', async () => {
      mockRepo.findOne.mockResolvedValue(null); // query filtra proprietarioId

      const result = await cupomService.responderTroca(99, 1, true);

      expect(result).toHaveProperty('erro');
      expect((result as { erro: string }).erro).toMatch(/não encontrada/i);
    });
  });
});
