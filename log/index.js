const dateFormat = require("dateformat");

const log = (message) => {
  const now = new Date();
  const dateTime = dateFormat(now, "yyyy-mm-dd HH:MM:ss");
  console.log(`[${dateTime}] ${message}`);
};

module.exports = log;
