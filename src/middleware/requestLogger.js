const requestLogger = (request, h) => {
  const { method, url, headers } = request;
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] ${method.toUpperCase()} ${url.pathname} - User-Agent: ${headers['user-agent']}`);
  
  return h.continue;
};

module.exports = requestLogger;