import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { plansApi } from '../services/api';
import type { Step, PlanFormData } from './CreatePlanPage/types';
import { DISTANCE_OPTIONS } from './CreatePlanPage/constants';
import { DistanceStep } from './CreatePlanPage/components/DistanceStep';
import { RaceDateStep } from './CreatePlanPage/components/RaceDateStep';
import { NameStep } from './CreatePlanPage/components/NameStep';
import { ChoiceStep } from './CreatePlanPage/components/ChoiceStep';
import { GeneratingStep } from './CreatePlanPage/components/GeneratingStep';

export function CreatePlanPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>('distance');
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    raceDistance: 0,
    raceDate: '',
  });
  const [choiceSelected, setChoiceSelected] = useState<'generate' | 'customize' | null>(null);

  const createPlanMutation = useMutation({
    mutationFn: (data: PlanFormData) => plansApi.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan'] });
      navigate('/plan');
    },
  });

  const handleDistanceSelect = (distance: number) => {
    const distanceLabel = DISTANCE_OPTIONS.find((opt) => opt.value === distance)?.label || 'Race';
    setFormData({
      ...formData,
      raceDistance: distance,
      name: `${distanceLabel} Training Plan`,
    });
  };

  const handleDistanceContinue = () => {
    if (formData.raceDistance > 0) {
      setStep('raceDate');
    }
  };

  const handleRaceDateSelect = (date: string) => {
    setFormData({ ...formData, raceDate: date });
  };

  const handleRaceDateContinue = () => {
    if (formData.raceDate) {
      setStep('name');
    }
  };

  const handleNameSubmit = () => {
    setStep('choice');
  };

  const handleGeneratePlan = async () => {
    setStep('generating');
    try {
      await createPlanMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error creating plan:', error);
      setStep('choice');
    }
  };

  const handleBack = () => {
    if (step === 'raceDate') setStep('distance');
    else if (step === 'name') setStep('raceDate');
    else if (step === 'choice') {
      setStep('name');
      setChoiceSelected(null);
    }
  };

  const handleClose = () => {
    navigate('/plan');
  };

  const getStepProgress = () => {
    const steps = ['distance', 'raceDate', 'name', 'choice'];
    const currentIndex = steps.indexOf(step);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const getContinueButtonProps = () => {
    if (step === 'distance') {
      return {
        show: true,
        disabled: formData.raceDistance === 0,
        onClick: handleDistanceContinue,
      };
    }
    if (step === 'raceDate') {
      return {
        show: true,
        disabled: !formData.raceDate,
        onClick: handleRaceDateContinue,
      };
    }
    if (step === 'name') {
      return {
        show: true,
        disabled: !formData.name.trim(),
        onClick: handleNameSubmit,
      };
    }
    if (step === 'choice') {
      return {
        show: true,
        disabled: choiceSelected !== 'generate',
        onClick: () => {
          if (choiceSelected === 'generate') {
            handleGeneratePlan();
          }
        },
      };
    }
    return { show: false, disabled: false, onClick: () => {} };
  };

  const continueButtonProps = getContinueButtonProps();

  return (
    <div className="bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button onClick={handleBack} className="p-2" disabled={step === 'distance' || step === 'generating'}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 mx-4">
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${getStepProgress()}%` }}
            />
          </div>
        </div>
        <button onClick={handleClose} className="p-2" disabled={step === 'generating'}>
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className={`px-4 py-8 ${continueButtonProps.show ? 'pb-32' : ''}`}>
        {step === 'distance' && (
          <DistanceStep onSelect={handleDistanceSelect} selected={formData.raceDistance} />
        )}
        {step === 'raceDate' && (
          <RaceDateStep onSelect={handleRaceDateSelect} selected={formData.raceDate} />
        )}
        {step === 'name' && (
          <NameStep
            value={formData.name}
            onChange={(name) => setFormData({ ...formData, name })}
          />
        )}
        {step === 'choice' && (
          <ChoiceStep
            selected={choiceSelected}
            onSelect={setChoiceSelected}
          />
        )}
        {step === 'generating' && <GeneratingStep />}
      </div>

      {/* Fixed Continue Button */}
      {continueButtonProps.show && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 px-4 py-4 border-t border-gray-800">
          <Button
            onClick={continueButtonProps.onClick}
            disabled={continueButtonProps.disabled}
            size="lg"
            className="w-full bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl py-6 text-lg font-semibold"
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}

