// tests/helpers/mockDataSource.ts
// Helper centralizado que mocka o AppDataSource do TypeORM.
// Importe este arquivo em cada teste unitário que dependa do banco.

export const mockRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  decrement: jest.fn(),
  increment: jest.fn(),
  findOneOrFail: jest.fn(),
  findOneByOrFail: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getCount: jest.fn(),
  }),
});

const appDataSourceMock = {
  getRepository: jest.fn(),
  query: jest.fn(),
  transaction: jest.fn(),
  initialize: jest.fn(),
  destroy: jest.fn(),
};

// Mock global do AppDataSource para ambos os pontos de import.
jest.mock('../../src/config/database', () => ({
  AppDataSource: appDataSourceMock,
}));

jest.mock('../../src/config/data-source', () => ({
  AppDataSource: appDataSourceMock,
}));
