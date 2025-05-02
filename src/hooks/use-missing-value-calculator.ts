
import { useState, useEffect } from "react";
import { CompoundingFrequency } from "@/utils/calculatorUtils";
import { useToast } from "@/components/ui/use-toast";

// Storage key for persisting calculator values
export const STORAGE_KEY = 'missingValueCalculator';

// Sample values to initialize calculator
export const SAMPLE_VALUES = {
  principal: "1000",
  rate: "5",
  time: "2",
  frequency: "monthly" as CompoundingFrequency,
  finalAmount: "1100"
};

export interface StoredValues {
  principal: string;
  rate: string;
  time: string;
  frequency: CompoundingFrequency;
  finalAmount: string;
}

export type SolveFor = 'principal' | 'rate' | 'time' | 'finalAmount';

export const useMissingValueCalculator = (
  initialSolveFor: SolveFor
) => {
  const [values, setValues] = useState<StoredValues>(() => {
    // On mount, set sample values except for the field being solved for
    const initial = { ...SAMPLE_VALUES };
    initial[initialSolveFor] = "";
    return initial;
  });
  
  const { toast } = useToast();

  // When solveFor changes, set sample values and clear the field to solve for
  useEffect(() => {
    setValues(prev => {
      const newValues = { ...SAMPLE_VALUES };
      newValues[initialSolveFor] = "";
      return newValues;
    });
  }, [initialSolveFor]);

  // Save values to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  }, [values]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFrequencyChange = (value: string) => {
    setValues(prev => ({
      ...prev,
      frequency: value as CompoundingFrequency
    }));
  };

  const resetFields = () => {
    setValues({
      principal: "",
      rate: "",
      time: "",
      frequency: "annually",
      finalAmount: ""
    });
    // Clear localStorage when resetting
    localStorage.removeItem(STORAGE_KEY);
    toast({
      title: "Fields Reset",
      description: "All fields have been cleared.",
    });
  };

  return {
    values,
    setValues,
    handleChange,
    handleFrequencyChange,
    resetFields,
  };
};
