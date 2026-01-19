import PDFParser from "pdf2json";
import fs from "fs";

export const convertPdfToJson = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const pdfParser = new PDFParser();

  pdfParser.on("pdfParser_dataReady", (pdfData) => {
    fs.unlinkSync(req.file.path);
    res.json(pdfData);
  });

  pdfParser.on("pdfParser_dataError", (err) => {
    fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.parserError });
  });

  pdfParser.loadPDF(req.file.path);
};
