import React, {
  useRef,
  useState,
  DragEvent,
  ChangeEvent,
} from "react";

import {BACKEND_BASE_URL} from "@/lib/constants";

type PdfResult = Record<string, unknown>;

const AddPdf: React.FC = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PdfResult | null>(null);

  const validateAndSetFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    validateAndSetFile(e.target.files?.[0]);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const uploadPdf = async (): Promise<void> => {
    if (!file) return;

    try {
      setLoading(true);
      setResult(null);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${BACKEND_BASE_URL}api/pdf/convert`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data: PdfResult = await res.json();
      setResult(data);
    } catch (err) {
      setError("Failed to upload PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
        style={{
          border: "2px dashed #999",
          padding: 40,
          textAlign: "center",
          cursor: "pointer",
          borderRadius: 10,
        }}
      >
        Drag & drop a PDF here or click to upload
      </div>

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={handleFileChange}
      />

      {/* Button */}
      <button
        onClick={uploadPdf}
        disabled={!file || loading}
        style={{
          marginTop: 20,
          width: "100%",
          padding: 10,
          cursor: "pointer",
        }}
      >
        {loading ? "Converting..." : "Convert PDF to JSON"}
      </button>

      {/* Selected File */}
      {file && (
        <p style={{ color: "green", marginTop: 10 }}>
          Selected: <strong>{file.name}</strong>
        </p>
      )}

      {/* Error */}
      {error && (
        <p style={{ color: "red", marginTop: 10 }}>{error}</p>
      )}

      {/* Result */}
      {result && (
        <pre
          style={{
            marginTop: 20,
            padding: 10,
            background: "#f5f5f5",
            maxHeight: 400,
            overflow: "auto",
            fontSize: 12,
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default AddPdf;
