import BloodSugarTrend from "@/components/HelathVisualizer";
import Doctor3DModel from "../temp/DoctorSkel";
import CBCVisualizer from "./CbcReport";

// api response (mock)
export const bloodSugarData = [
  {
    timestamp: "2024-09-01",
    value: 92,
    unit: "mg/dL",
    lab: "AIIMS Delhi",
    normalRange: { min: 70, max: 100 },
    txHash: "0x91afc34bda91f234adf",
    verified: true
  },
  {
    timestamp: "2024-10-01",
    value: 118,
    unit: "mg/dL",
    lab: "Apollo Diagnostics",
    normalRange: { min: 70, max: 100 },
    txHash: "0x82be91d7123fd9123aa",
    verified: true
  },
  {
    timestamp: "2024-11-01",
    value: 135,
    unit: "mg/dL",
    lab: "AIIMS Delhi",
    normalRange: { min: 70, max: 100 },
    txHash: "0x71aa9c91a912aa192fa",
    verified: true
  }
];


export default function PatientHealthDashboard() {
  return (
    <div className="h-screen bg-gray-100 flex gap-4 p-8 overflow-hidden">
      <Doctor3DModel />

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto w-full">
        <BloodSugarTrend data={bloodSugarData} />
        <CBCVisualizer />
      </div>
    </div>
  );
}
