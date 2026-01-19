import express from 'express';
import cors from 'cors';
import pdfRoutes from './routes/pdfRoutes.js'

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/pdf", pdfRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
