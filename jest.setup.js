// jest.setup.js
jest.mock(
  "@cloudflare/next-on-pages",
  () => ({
    getRequestContext: jest.fn(() => ({
      env: {
        DB: {
          prepare: jest.fn().mockReturnThis(),
          bind: jest.fn().mockReturnThis(),
          all: jest.fn().mockResolvedValue({ results: [] }),
        },
      },
    })),
  }),
  { virtual: true },
);
