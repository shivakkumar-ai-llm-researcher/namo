module.exports = {
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true, size: 1024 }),
  readAsStringAsync: jest.fn().mockResolvedValue('base64data'),
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  documentDirectory: '/tmp/',
  EncodingType: { Base64: 'base64', UTF8: 'utf8' },
};
