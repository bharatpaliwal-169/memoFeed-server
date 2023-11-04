import winston, { format } from "winston";

const logFormat = winston.format.printf(info => `[${info.level}] : ${info.timestamp} - ${info.message} `);

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss.sss' }),
    format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
  ),
  
  transports: [

    //dev - console
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        logFormat
      )
    }),

    //dev-prod - file
    new winston.transports.File({
      //path to log folder from root
      filename: './logs/server.log',
      format: format.combine(
        logFormat
      )
    }),
  ],
  exitOnError: false
});

export default logger;