const app = require('./service.js');

const port = process.argv[2] || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});


const metrics = require('./metrics');
let greeting = 'hello';



app.get('/hello/:name', (req, res) => {
  metrics.incrementRequests();
  res.send({ [greeting]: req.params.name });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
