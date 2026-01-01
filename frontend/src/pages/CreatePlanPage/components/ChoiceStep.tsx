interface ChoiceStepProps {
  selected: 'generate' | 'customize' | null;
  onSelect: (value: 'generate' | 'customize' | null) => void;
}

export function ChoiceStep({ selected, onSelect }: ChoiceStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">How would you like to proceed?</h1>
        <p className="text-gray-400">Choose how to create your training plan</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onSelect('generate')}
          className={`w-full p-6 rounded-2xl text-left transition-all ${
            selected === 'generate'
              ? 'bg-teal-500 ring-2 ring-teal-400'
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="text-xl font-bold text-white">
              Generate from recent activities
            </div>
            <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
              Recommended
            </div>
          </div>
          <p className={`text-sm ${selected === 'generate' ? 'text-white/90' : 'text-gray-300'}`}>
            We'll analyze your recent runs and create a personalized plan based on your current
            fitness level
          </p>
        </button>

        <button
          disabled
          className="w-full p-6 rounded-2xl text-left bg-gray-800 opacity-50 cursor-not-allowed"
        >
          <div className="text-xl font-bold mb-2">Customize training preferences</div>
          <p className="text-sm text-gray-400">
            Manually set your training intensity, available days, and more (Coming soon)
          </p>
        </button>
      </div>
    </div>
  );
}

