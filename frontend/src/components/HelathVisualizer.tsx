import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  Legend
} from "recharts";

interface RecordType {
  timestamp: string;
  value: number;
  unit: string;
  lab: string;
  normalRange: { min: number; max: number };
  txHash: string;
  verified: boolean;
}

export default function BloodSugarTrend({ data }: {data: RecordType[]}) {
  const chartData = data.map(item => ({
    date: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: item.value,
    lab: item.lab
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Blood Sugar Trend</h2>
        <p className="text-sm text-gray-600">Normal Range: 70-100 mg/dL</p>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[60, 150]} />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const dataPoint = data[payload[0].payload.date === chartData[0].date ? 0 : payload[0].payload.date === chartData[1].date ? 1 : 2];
                return (
                  <div className="bg-white p-4 border border-gray-300 rounded shadow-lg">
                    <p className="font-semibold">{payload[0].payload.date}</p>
                    <p className="text-lg font-bold text-blue-600">{payload[0].value} mg/dL</p>
                    <p className="text-sm text-gray-600">{dataPoint.lab}</p>
                    <p className="text-xs text-green-600 mt-1">✓ Verified on blockchain</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <ReferenceLine y={70} stroke="#10b981" strokeDasharray="3 3" label="Min Normal" />
          <ReferenceLine y={100} stroke="#10b981" strokeDasharray="3 3" label="Max Normal" />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 6 }}
            activeDot={{ r: 8 }}
            name="Blood Sugar (mg/dL)"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {data.map((item, idx) => (
          <div key={idx} className="border border-gray-200 rounded p-3">
            <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleDateString()}</p>
            <p className="text-lg font-bold text-gray-800">{item.value} {item.unit}</p>
            <p className="text-xs text-gray-600">{item.lab}</p>
            {item.verified && (
              <p className="text-xs text-green-600 mt-1">✓ Blockchain Verified</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}