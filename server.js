const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/test', (req, res) => {
  res.send({ some: 'Hello frasfoddm gus!' });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
