module.exports = {
  Platform: { OS: 'ios', select: (s) => s.ios ?? s.default },
  Alert: { alert: jest.fn() },
};
