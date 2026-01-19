import express from "express";
import upload from "../middlewares/uploadFiles.js";
import { convertPdfToJson } from "../controllers/pdf.controller.js";

const router = express.Router();

router.post(
  "/convert",
  upload.single("file"),
  convertPdfToJson
);

export default router;
