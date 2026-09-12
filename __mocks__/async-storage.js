const store = {};
module.exports = {
  getItem: jest.fn(async (k) => store[k] ?? null),
  setItem: jest.fn(async (k, v) => { store[k] = v; }),
  removeItem: jest.fn(async (k) => { delete store[k]; }),
  multiRemove: jest.fn(async (keys) => keys.forEach(k => delete store[k])),
};
