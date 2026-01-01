interface NameStepProps {
  value: string;
  onChange: (value: string) => void;
}

export function NameStep({ value, onChange }: NameStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Name your plan</h1>
        <p className="text-gray-400">Give your training plan a memorable name</p>
      </div>

      <div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., Marathon Training Plan"
          className="w-full p-4 bg-gray-800 rounded-2xl border-2 border-gray-700 focus:border-teal-500 focus:outline-none text-white text-lg"
          autoFocus
        />
      </div>
    </div>
  );
}

