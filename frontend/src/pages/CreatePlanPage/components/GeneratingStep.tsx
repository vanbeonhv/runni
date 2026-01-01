export function GeneratingStep() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-gray-700 border-t-teal-500 animate-spin" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Generating your plan...</h2>
        <p className="text-gray-400">Analyzing your recent activities and creating workouts</p>
      </div>
    </div>
  );
}

