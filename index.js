const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const express = require("express");
const cors = require("cors");
const log = require("@kluddizz/log");

const app = express();
const port = process.env.PORT || 5000;

// Install middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());
app.use(cors());

app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    const ip =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    log(`authentication failed for ${ip}`, "error");

    res.status(403).json({
      status: 403,
      message: "Unauthorized",
    });
  } else {
    next();
  }
});

// The following code is used to load all routes inside the routes folder
// automatically. Every route is represented by a 'express.Router' instance.
const routesPath = path.join(process.cwd(), "routes");

fs.readdirSync(routesPath).forEach((filename) => {
  const routePath = `./routes/${filename}`;

  if (path.extname(routePath) == ".js") {
    const routeName = path.basename(filename, ".js");
    const route = require(routePath);

    route.use((err, req, res, next) => {
      log(err.message, "error");

      res.status(400).json({
        status: 400,
        message: "An error occured",
      });
    });

    app.use(`/${routeName}`, route);
  }
});

// Start the backend server.
app.listen(port, () => {
  log(`running on port ${port}`);
});
