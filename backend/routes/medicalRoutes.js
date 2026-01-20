import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/convert", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname.toLowerCase();
    const fileExt = path.extname(fileName);

    let result = {};

    // Determine file type and convert accordingly
    if (fileExt === ".dcm" || fileExt === ".dicom") {
      // DICOM file conversion
      result = await convertDicomToJson(filePath, fileName);
    } else if (fileExt === ".nii" || fileName.endsWith(".nii.gz")) {
      // NIfTI file conversion
      result = await convertNiftiToJson(filePath, fileName);
    } else if (fileExt === ".hl7" || fileExt === ".xml") {
      // HL7 file conversion
      result = await convertHL7ToJson(filePath, fileName);
    } else if (fileExt === ".pdf") {
      // PDF conversion (reuse existing logic)
      const PDFParser = (await import("pdf2json")).default;
      const pdfParser = new PDFParser();

      result = await new Promise((resolve, reject) => {
        pdfParser.on("pdfParser_dataError", (errData) =>
          reject(errData.parserError),
        );
        pdfParser.on("pdfParser_dataReady", (pdfData) => {
          const extractedText = pdfData.Pages.map((page) =>
            page.Texts.map((text) =>
              decodeURIComponent(text.R.map((r) => r.T).join("")),
            ).join(" "),
          ).join("\n");

          resolve({
            type: "PDF",
            fileName: req.file.originalname,
            pageCount: pdfData.Pages.length,
            text: extractedText,
            metadata: {
              title: pdfData.Meta?.Title || "Untitled",
              author: pdfData.Meta?.Author || "Unknown",
              creator: pdfData.Meta?.Creator || "Unknown",
              producer: pdfData.Meta?.Producer || "Unknown",
              creationDate: pdfData.Meta?.CreationDate || null,
            },
            rawData: pdfData,
          });
        });
        pdfParser.loadPDF(filePath);
      });
    } else if ([".jpg", ".jpeg", ".png", ".gif"].includes(fileExt)) {
      // Image file metadata extraction
      result = await convertImageToJson(filePath, fileName, req.file);
    } else {
      // Generic file info
      result = {
        type: "Generic",
        fileName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        message:
          "File format not specifically supported, showing basic metadata",
      };
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json(result);
  } catch (error) {
    console.error("Conversion error:", error);

    // Clean up file if exists
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: "Conversion failed",
      message: error.message,
      details: "The file format may not be fully supported yet",
    });
  }
});

// DICOM conversion (mock implementation - would need dicom-parser library)
async function convertDicomToJson(filePath, fileName) {
  // Note: This is a simplified version. For full DICOM support, install 'dicom-parser' package
  const fileBuffer = fs.readFileSync(filePath);

  return {
    type: "DICOM",
    fileName: fileName,
    format: "Digital Imaging and Communications in Medicine",
    size: fileBuffer.length,
    message: "DICOM file detected",
    metadata: {
      modality: "CT/MRI/X-Ray (requires full parser)",
      patientInfo: "Protected - requires dicom-parser library",
      studyDate: new Date().toISOString(),
      imageSize: "Unknown",
    },
    note: "Install dicom-parser npm package for full DICOM support",
    sampleData: {
      transferSyntax: "Implicit VR Little Endian",
      sopClassUID: "1.2.840.10008.5.1.4.1.1.2",
      studyInstanceUID: "Sample UID",
    },
  };
}

// NIfTI conversion (mock implementation)
async function convertNiftiToJson(filePath, fileName) {
  const fileBuffer = fs.readFileSync(filePath);

  return {
    type: "NIfTI",
    fileName: fileName,
    format: "Neuroimaging Informatics Technology Initiative",
    size: fileBuffer.length,
    message: "NIfTI neuroimaging file detected",
    metadata: {
      dimensions: "Requires nifti-reader-js library",
      voxelSize: "Unknown",
      dataType: "Brain imaging data",
      orientation: "RAS/LAS",
    },
    note: "Install nifti-reader-js npm package for full NIfTI support",
    sampleData: {
      imageType: "3D/4D Brain Scan",
      slices: "Multiple",
    },
  };
}

// HL7 conversion
async function convertHL7ToJson(filePath, fileName) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const lines = fileContent.split("\n");

  const segments = lines
    .map((line) => {
      if (!line.trim()) return null;
      const fields = line.split("|");
      return {
        segmentType: fields[0],
        fields: fields.slice(1),
      };
    })
    .filter(Boolean);

  return {
    type: "HL7",
    fileName: fileName,
    format: "Health Level 7",
    message: "HL7 clinical data message",
    messageType: segments[0]?.fields[8] || "Unknown",
    segments: segments,
    metadata: {
      messageControlId: segments[0]?.fields[9] || "Unknown",
      processingId: segments[0]?.fields[10] || "Unknown",
      versionId: segments[0]?.fields[11] || "2.5",
    },
  };
}

// Image metadata extraction
async function convertImageToJson(filePath, fileName, fileInfo) {
  const fileBuffer = fs.readFileSync(filePath);

  return {
    type: "Medical Image",
    fileName: fileName,
    format: fileInfo.mimetype,
    size: fileInfo.size,
    sizeReadable: `${(fileInfo.size / 1024 / 1024).toFixed(2)} MB`,
    message: "Medical image file detected",
    metadata: {
      mimeType: fileInfo.mimetype,
      encoding: "7bit",
      uploadedAt: new Date().toISOString(),
    },
    note: "For detailed EXIF data, install sharp or exif-parser package",
    imageInfo: {
      width: "Requires image processing library",
      height: "Requires image processing library",
      colorSpace: "RGB/Grayscale",
    },
  };
}

export default router;
