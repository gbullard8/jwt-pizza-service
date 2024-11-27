const app = require('./service.js'); 
const metrics = require('./metrics'); 

const port = process.argv[2] || 3000;


app.use((req, res, next) => {
  metrics.incrementRequests(req.method); 
  next();
});





app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});



