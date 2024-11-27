const app = require('./service.js'); 
const metrics = require('./metrics'); 

const port = process.argv[2] || 3000;


app.use((req, res, next) => {
  metrics.incrementRequests(req.method); 
  next();
});


// app.post('/api/auth', (req, res) => {
//   if (req.body.email) {
//     metrics.incrementRequests('POST');
//     res.send({ message: 'Auth Success' });
//   } else {
//     res.status(400).send({ error: 'Auth Failed' });
//   }
// });

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});



