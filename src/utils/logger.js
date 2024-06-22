const {createLogger} = require('winston')
const winston = require('winston');
require('winston-daily-rotate-file');


var transport = new winston.transports.DailyRotateFile({
  filename: `${__dirname}/log/info/info-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  colorize: true,
  zippedArchive: false,
  maxSize: '50mb',
  maxFiles: '5d',
  timestamp: function(){
    return Date.now();
  },
  formatter: function(info){
    info =>`${info.message}`
   }
});
const logger_info = createLogger({
  transports:[transport]
})

var transport_error = new winston.transports.DailyRotateFile({
  filename: `${__dirname}/log/error/error%DATE%.log`,
  datePattern: 'YYYY-MM-DD',  
  colorize: true,
  zippedArchive: false,
  maxSize: '50mb',  
  maxFiles: '5d',
  timestamp: function(){
    return Date.now();  
  },
  formatter: function(info){
    info =>`${info.message}`
   }
});
const logger_error = createLogger({
  transports:[transport_error]
})

module.exports = {
  log_info  : logger_info,
  log_error : logger_error
};