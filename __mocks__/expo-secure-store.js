const store = {};
module.exports = {
  getItemAsync: jest.fn(async (k) => store[k] ?? null),
  setItemAsync: jest.fn(async (k, v) => { store[k] = v; }),
  deleteItemAsync: jest.fn(async (k) => { delete store[k]; }),
};
