import rateLimit from 'express-rate-limit';

const ApiRateLimiter = rateLimit({
  windowMs : 60 * 1000, //1 minute
  max : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message : "Too many attempts"
}) 

export default ApiRateLimiter;