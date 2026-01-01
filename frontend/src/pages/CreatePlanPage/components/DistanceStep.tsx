import { DISTANCE_OPTIONS } from '../constants';

interface DistanceStepProps {
  onSelect: (distance: number) => void;
  selected: number;
}

export function DistanceStep({ onSelect, selected }: DistanceStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Choose your race distance</h1>
        <p className="text-gray-400">Select the distance you want to train for</p>
      </div>

      <div className="space-y-3">
        {DISTANCE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`w-full p-4 rounded-2xl text-left transition-all ${
              selected === option.value
                ? 'bg-teal-500 ring-2 ring-teal-400'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <div className="text-xl font-semibold mb-1">{option.label}</div>
            <div className="text-sm text-gray-300">Recommended: {option.duration}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

