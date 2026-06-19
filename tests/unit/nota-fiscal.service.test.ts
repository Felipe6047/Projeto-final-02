import { processarNotaFiscal } from "../../src/services/nota-fiscal.service";
import { AppDataSource } from "../../src/config/database";

jest.mock("../../src/config/database");
jest.mock("../../src/services/compra.service", () => ({
  registrarCompra: jest.fn().mockResolvedValue({
    compraId: "1",
    pontosGerados: 1200,
    saldoPontos: 3700,
  }),
}));

const mockRepo = {
  findOne: jest.fn(),
  save: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);
});

describe("nota-fiscal.service", () => {
  it("rejeita nota já processada", async () => {
    mockRepo.findOne.mockResolvedValueOnce({
      chave: "04",
      status: "processada",
      valorTotal: "50.00",
    });
    const res = await processarNotaFiscal(1, "04");
    expect(res).toEqual({ erro: "Esta Nota Fiscal já foi utilizada." });
  });

  it("retorna confirmação pendente para CPF novo", async () => {
    mockRepo.findOne
      .mockResolvedValueOnce({
        chave: "03",
        status: "disponivel",
        valorTotal: "85.50",
        cpf: "33333333334",
      })
      .mockResolvedValueOnce({ id: 2, cpf: null });
    const res = await processarNotaFiscal(2, "03");
    expect(res).toMatchObject({
      status: "confirmacao_pendente",
      cpfNota: "33333333334",
    });
  });
});
