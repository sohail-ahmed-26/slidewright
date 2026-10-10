import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Serve outputs statically
const outputsDir = path.resolve(__dirname, '../../outputs');
app.use('/outputs', express.static(outputsDir));

app.get('/api/health', (req, res) => {
  // DB Check to be implemented
  res.json({ status: 'OK', db: 'OK' });
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
