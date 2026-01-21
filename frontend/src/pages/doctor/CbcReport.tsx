import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ReferenceArea,
    ResponsiveContainer
} from "recharts";

type CBCMetric = "hemoglobin" | "wbc" | "platelets" | "rbc";

type CBCRecord = {
    date: string;
    hemoglobin: number;
    wbc: number;
    platelets: number;
    rbc: number;
    txHash: string;
    verified: boolean;
};


export default function CBCVisualizer() {
    // Dummy backend data
    const data = [
        {
            date: "2024-09-01",
            hemoglobin: 12.8,
            wbc: 8600,
            platelets: 240000,
            rbc: 4.5,
            txHash: "0xa91bcde123",
            verified: true
        },
        {
            date: "2024-10-01",
            hemoglobin: 11.9,
            wbc: 10200,
            platelets: 210000,
            rbc: 4.2,
            txHash: "0xbb19cd8123",
            verified: true
        },
        {
            date: "2024-11-01",
            hemoglobin: 10.7,
            wbc: 11800,
            platelets: 185000,
            rbc: 3.9,
            txHash: "0xc7812abcd9",
            verified: true
        }
    ];

    const ranges: Record<CBCMetric, { min: number; max: number; unit: string; }> = {
        hemoglobin: { min: 12, max: 16, unit: "g/dL" },
        wbc: { min: 4000, max: 11000, unit: "/µL" },
        platelets: { min: 150000, max: 450000, unit: "/µL" },
        rbc: { min: 4.2, max: 5.9, unit: "million/µL" }
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-2xl font-semibold mb-1">
                Complete Blood Count (CBC)
            </h2>
            <p className="text-sm text-gray-500 mb-6">
                Blockchain-verified blood diagnostics
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(Object.keys(ranges) as CBCMetric[]).map((key) => {
                    const range = ranges[key];
                    const latest = data[data.length - 1][key];
                    const abnormal = latest < range.min || latest > range.max;


                    return (
                        <div key={key} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold capitalize">{key}</h3>
                                <span
                                    className={`text-xs px-2 py-1 rounded-full ${abnormal
                                            ? "bg-red-100 text-red-700"
                                            : "bg-green-100 text-green-700"
                                        }`}
                                >
                                    {abnormal ? "Abnormal" : "Normal"}
                                </span>
                            </div>

                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={data}>
                                    <XAxis dataKey="date" />
                                    <YAxis />

                                    <ReferenceArea
                                        y1={range.min}
                                        y2={range.max}
                                        fill="#22c55e"
                                        fillOpacity={0.15}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey={key}
                                        stroke="#2563eb"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />

                                    <Tooltip
                                        content={({ payload }) => {
                                            if (!payload?.length) return null;
                                            const record = payload[0].payload;

                                            return (
                                                <div className="bg-white p-3 rounded shadow text-sm border">
                                                    <p className="font-medium">
                                                        {payload[0].value} {range.unit}
                                                    </p>
                                                    <p className="text-green-600 text-xs mt-1">
                                                        ✔ Blockchain Verified
                                                    </p>
                                                    <p className="text-xs text-gray-500 break-all">
                                                        Tx: {record.txHash}
                                                    </p>
                                                </div>
                                            );
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
