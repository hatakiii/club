// __mocks__/cloudflare.ts
export const getRequestContext = jest.fn(() => ({
  env: {
    DB: {
      prepare: jest.fn().mockReturnThis(),
      bind: jest.fn().mockReturnThis(),
      all: jest.fn().mockResolvedValue({ results: [] }),
      first: jest.fn().mockResolvedValue({}),
      run: jest.fn().mockResolvedValue({}),
    },
  },
}));
