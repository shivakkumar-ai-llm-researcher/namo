module.exports = {
  decode: jest.fn((b64) => new ArrayBuffer(8)),
  encode: jest.fn(() => 'mockbase64'),
};
