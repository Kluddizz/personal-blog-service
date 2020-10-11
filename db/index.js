const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const configFileName = path.join(process.cwd(), "postgres.json");
const config = require(configFileName);

const pool = new Pool(config);

module.exports = {
  query: (text, params, callback) => pool.query(text, params, callback),
  close: () => pool.end(),
};
