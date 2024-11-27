const app = require('./service.js');

const port = process.argv[2] || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

const express = require('express');
app = express();

const metrics = require('./metrics');
let greeting = 'hello';

app.use(express.json());

app.get('/hello/:name', (req, res) => {
  metrics.incrementRequests();
  res.send({ [greeting]: req.params.name });
});

app.listen(3000, function () {
  console.log(`Listening on port 3000`);
});
