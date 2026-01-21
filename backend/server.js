import express from "express";
import cors from "cors";
import pdfRoutes from "./routes/pdfRoutes.js";
import medicalRoutes from "./routes/medicalRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/pdf", pdfRoutes);
app.use("/api/medical", medicalRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
