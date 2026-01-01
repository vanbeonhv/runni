import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

interface RaceDateStepProps {
  onSelect: (date: string) => void;
  selected: string;
}

export function RaceDateStep({ onSelect, selected }: RaceDateStepProps) {
  const [selectedDate, setSelectedDate] = useState(selected || '');

  // Sync with prop when it changes
  useEffect(() => {
    if (selected && selected !== selectedDate) {
      setSelectedDate(selected);
    }
  }, [selected]);

  const quickDates = [
    { label: '4 weeks', date: dayjs().add(4, 'week') },
    { label: '8 weeks', date: dayjs().add(8, 'week') },
    { label: '12 weeks', date: dayjs().add(12, 'week') },
    { label: '16 weeks', date: dayjs().add(16, 'week') },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">When is your race?</h1>
        <p className="text-gray-400">Select your target race date</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {quickDates.map((quick) => (
            <button
              key={quick.label}
              onClick={() => {
                const date = quick.date.format('YYYY-MM-DD');
                setSelectedDate(date);
                onSelect(date);
              }}
              className={`p-4 rounded-2xl text-left transition-all ${
                selectedDate === quick.date.format('YYYY-MM-DD')
                  ? 'bg-teal-500 ring-2 ring-teal-400'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <div className="text-sm text-gray-300 mb-1">{quick.label}</div>
              <div className="text-lg font-semibold">{quick.date.format('MMM D, YYYY')}</div>
            </button>
          ))}
        </div>

        <div className="pt-4">
          <label className="block text-sm text-gray-400 mb-2">Or pick a custom date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              onSelect(e.target.value);
            }}
            min={dayjs().add(3, 'week').format('YYYY-MM-DD')}
            className="w-full p-4 bg-gray-800 rounded-2xl border-2 border-gray-700 focus:border-teal-500 focus:outline-none text-white"
          />
        </div>
      </div>
    </div>
  );
}

