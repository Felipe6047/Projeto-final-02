// tests/unit/presente.service.test.ts
import { mockRepository } from '../helpers/mockDataSource';
import { AppDataSource } from '../../src/config/database';
import * as presenteService from '../../src/services/presente.service';

jest.mock('../../src/services/gamificacao.service', () => ({
  criarNotificacao: jest.fn(),
  incrementarMissao: jest.fn(),
  verificarConquistas: jest.fn(),
}));

const mockRepo = mockRepository();
const mockManager = {
  getRepository: jest.fn().mockReturnValue(mockRepo),
};

(AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);
(AppDataSource.transaction as jest.Mock).mockImplementation(
  async (cb: (m: typeof mockManager) => unknown) => cb(mockManager)
);

describe('presente.service', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── presentearCupom ──────────────────────────────────────────────────────

  describe('presentearCupom()', () => {
    it('P01 - Bronze não pode presentear cupom (nível não permite)', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.getRawOne.mockResolvedValue({ pode_presentear_cupom: false });

      const result = await presenteService.presentearCupom({
        remetenteId: 1,
        cupomId: 1,
        canal: 'link',
      });

      expect(result).toHaveProperty('erro');
      expect((result as { erro: string }).erro).toMatch(/nível não permite/i);
    });

    it('P02 - Prata+ pode presentear cupom válido com sucesso', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.getRawOne.mockResolvedValue({ pode_presentear_cupom: true });
      mockRepo.findOne
        .mockResolvedValueOnce({ id: '5', usuarioId: 1, status: 'disponivel' }) // cupom
        .mockResolvedValueOnce(null); // destinatário não encontrado

      mockRepo.save
        .mockResolvedValueOnce({ id: '99', codigoResgate: 'abc123' }) // PresenteCupom
        .mockResolvedValueOnce({}); // cupom.status = presenteado

      const result = await presenteService.presentearCupom({
        remetenteId: 1,
        cupomId: 5,
        canal: 'email',
        destinatarioEmail: 'amigo@email.com',
      });

      expect(result).toHaveProperty('codigoResgate');
      expect(result).toHaveProperty('link');
    });

    it('P03 - cupom indisponível retorna erro', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.getRawOne.mockResolvedValue({ pode_presentear_cupom: true });
      mockRepo.findOne.mockResolvedValue(null); // cupom não encontrado

      const result = await presenteService.presentearCupom({
        remetenteId: 1,
        cupomId: 999,
        canal: 'link',
      });

      expect(result).toHaveProperty('erro');
      expect((result as { erro: string }).erro).toMatch(/indisponível/i);
    });

    it('P04 - presentear muda status do cupom para presenteado', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.getRawOne.mockResolvedValue({ pode_presentear_cupom: true });

      const fakeCupom = { id: '5', usuarioId: 1, status: 'disponivel' };
      mockRepo.findOne
        .mockResolvedValueOnce(fakeCupom)
        .mockResolvedValueOnce(null);
      mockRepo.save.mockResolvedValue({ id: '1' });

      await presenteService.presentearCupom({
        remetenteId: 1, cupomId: 5, canal: 'link',
      });

      expect(mockRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'presenteado' })
      );
    });
  });

  // ─── criarPedidoPresente ──────────────────────────────────────────────────

  describe('criarPedidoPresente()', () => {
    it('P05 - Bronze não pode presentear produto físico', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.getRawOne.mockResolvedValue({ pode_presentear_produto: false, valor_max_presente: null });

      const result = await presenteService.criarPedidoPresente({
        remetenteId: 1,
        itens: [{ produtoId: 1, quantidade: 1 }],
        pontosUsados: 0,
        valorReais: 50,
        destinatario: { nome: 'Carlos' },
        endereco: {},
      });

      expect(result).toHaveProperty('erro');
      expect((result as { erro: string }).erro).toMatch(/nível não permite/i);
    });

    it('P06 - Ouro com valor acima de R$100 retorna erro de valor máximo', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.getRawOne.mockResolvedValue({
        pode_presentear_produto: true,
        valor_max_presente: '100.00',
      });

      const result = await presenteService.criarPedidoPresente({
        remetenteId: 1,
        itens: [{ produtoId: 1, quantidade: 1 }],
        pontosUsados: 0,
        valorReais: 150, // acima do limite
        destinatario: { nome: 'Carlos' },
        endereco: {},
      });

      expect(result).toHaveProperty('erro');
      expect((result as { erro: string }).erro).toMatch(/R\$ 100/);
    });

    it('P07 - Platina pode presentear produto sem limite de valor', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.getRawOne.mockResolvedValue({
        pode_presentear_produto: true,
        valor_max_presente: null, // sem limite
      });

      const transactionRepo = {
        save: jest.fn().mockResolvedValue({ id: '50' }),
        findOne: jest.fn().mockResolvedValue({
          id: 1,
          ativo: true,
          precoReais: '500.00',
          precoPontos: 5000,
        }),
        decrement: jest.fn(),
      };
      (AppDataSource.transaction as jest.Mock).mockImplementationOnce(
        async (cb: (m: { getRepository: jest.Mock }) => unknown) =>
          cb({
            getRepository: jest.fn().mockReturnValue(transactionRepo),
          })
      );

      const result = await presenteService.criarPedidoPresente({
        remetenteId: 1,
        itens: [{ produtoId: 1, quantidade: 1 }],
        pontosUsados: 0,
        valorReais: 999,
        destinatario: { nome: 'VIP' },
        endereco: {},
      });

      expect(result).not.toHaveProperty('erro');
      expect(result).toHaveProperty('pedidoId');
    });

    it('P08 - criarPedidoPresente debita pontos do remetente quando pontosUsados > 0', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.getRawOne.mockResolvedValue({
        pode_presentear_produto: true,
        valor_max_presente: null,
      });
      const transactionRepo = {
        save: jest.fn().mockResolvedValue({ id: '50' }),
        findOne: jest.fn().mockResolvedValue({
          id: 1,
          ativo: true,
          precoReais: '50.00',
          precoPontos: 500,
        }),
        decrement: jest.fn().mockResolvedValue({}),
      };
      (AppDataSource.transaction as jest.Mock).mockImplementationOnce(
        async (cb: (m: { getRepository: jest.Mock }) => unknown) =>
          cb({
            getRepository: jest.fn().mockReturnValue(transactionRepo),
          })
      );

      await presenteService.criarPedidoPresente({
        remetenteId: 1,
        itens: [{ produtoId: 1, quantidade: 1 }],
        pontosUsados: 200,
        valorReais: 50,
        destinatario: { nome: 'Carlos' },
        endereco: {},
      });

      expect(transactionRepo.decrement).toHaveBeenCalledWith(
        { id: 1 }, 'pontos', 200
      );
    });

    it('P11 - produto inativo no carrinho lança erro', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.getRawOne.mockResolvedValue({
        pode_presentear_produto: true,
        valor_max_presente: null,
      });
      mockRepo.save.mockResolvedValue({ id: '50' });
      mockRepo.findOne.mockResolvedValue(null); // produto não encontrado/inativo

      await expect(
        presenteService.criarPedidoPresente({
          remetenteId: 1,
          itens: [{ produtoId: 999, quantidade: 1 }],
          pontosUsados: 0,
          valorReais: 50,
          destinatario: { nome: 'Carlos' },
          endereco: {},
        })
      ).rejects.toThrow('Produto inválido');
    });
  });
});
