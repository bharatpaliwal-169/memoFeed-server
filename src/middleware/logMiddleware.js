import logger from "../services/Logger/index.js";

const logMiddleware = async(req,res,next) => {
  try {
    logger.info(`Request recieved ${req.method} ${req.url}`);

    res.on('finish', () => {
      logger.info(`Response send with ${res.statusCode} ${res.statusMessage};  ${res.get('Content-Length') || 0}b sent`);
    });
    next();
  } catch (error) {
    logger.error("[logMiddleWare] ERROR----->" + error);
  }
}

export default logMiddleware;