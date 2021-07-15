const express = require('express');
const router = require('./router');
const database = require('./database');

const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());

app.use('/', router);

database.verify().then(() => {
  startServer();
}).catch(async (err) => {
  try {
    await database.createTables();
    startServer();
  } catch (e) {
    console.error(e);
    console.error("There's a problem with the database");
  }
});

function startServer() {
  app.listen(port, () => {
    console.log("server is running");
  });
}