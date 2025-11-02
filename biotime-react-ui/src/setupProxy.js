const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/files',
    createProxyMiddleware({
      target: 'http://192.168.2.239:5116', // Your .NET API address
      changeOrigin: true,
    })
  );
};
