const express = require('express');
const app = express();
const port = 3001;

app.get('/', (req, res) => {
  res.send('GammaX Backend is running!');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
