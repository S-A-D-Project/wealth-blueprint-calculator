
import { supabase } from "@/integrations/supabase/client";
import { 
  CompoundingFrequency,
  calculateMissingPrincipal,
  calculateMissingFinalAmount,
  calculateMissingRate,
  calculateMissingTime,
} from "@/utils/calculatorUtils";
import { StoredValues, SolveFor } from "@/hooks/use-missing-value-calculator";

export interface NumericValues {
  principal: number | null;
  rate: number | null;
  time: number | null;
  finalAmount: number | null;
  frequency: CompoundingFrequency;
}

// Helper function to clean number inputs
export function cleanNumberInput(input: string): string {
  // Remove all non-numeric, non-decimal, non-minus characters
  return input.replace(/[^0-9.-]/g, '');
}

// Format the calculation result based on the field type
export function formatResult(value: number, field: keyof NumericValues): string {
  switch (field) {
    case 'principal':
    case 'finalAmount':
      return formatCurrency(value);
    case 'rate':
      return value.toFixed(2) + '%';
    case 'time':
      return value.toFixed(2) + ' years';
    default:
      return value.toString();
  }
}

// Format currency values
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export async function performCalculation(
  values: StoredValues,
  solveFor: SolveFor,
  setValues: React.Dispatch<React.SetStateAction<StoredValues>>,
  onCalculate: (params: any, solveFor: SolveFor) => void,
  showToast: (title: string, description: string, variant?: "default" | "destructive") => void
) {
  // Prevent calculation if any required field is empty
  const requiredFields = ['principal', 'rate', 'time', 'finalAmount'].filter(f => f !== solveFor);
  for (const field of requiredFields) {
    if (!values[field as keyof StoredValues] || values[field as keyof StoredValues].trim() === '') {
      showToast("Missing Input", "Please fill in all required fields before calculating.", "destructive");
      return;
    }
  }

  // Clean and parse all non-empty values
  const numericValues: NumericValues = {
    principal: solveFor !== 'principal' && values.principal.trim() !== "" ? parseFloat(cleanNumberInput(values.principal)) : null,
    rate: solveFor !== 'rate' && values.rate.trim() !== "" ? parseFloat(cleanNumberInput(values.rate)) : null,
    time: solveFor !== 'time' && values.time.trim() !== "" ? parseFloat(cleanNumberInput(values.time)) : null,
    finalAmount: solveFor !== 'finalAmount' && values.finalAmount.trim() !== "" ? parseFloat(cleanNumberInput(values.finalAmount)) : null,
    frequency: values.frequency
  };

  // Validate required fields
  for (const [key, value] of Object.entries(numericValues)) {
    if (key !== 'frequency' && key !== solveFor && (value === null || isNaN(value))) {
      showToast("Invalid Input", `Please enter a valid number for ${key}.`, "destructive");
      return;
    }
    if (key !== 'frequency' && key !== solveFor && value !== null && value < 0) {
      showToast("Invalid Input", `Please enter a non-negative number for ${key}.`, "destructive");
      return;
    }
  }

  let result: number;
  let resultField: keyof NumericValues = solveFor;

  // Calculate the selected variable
  if (solveFor === 'principal') {
    result = calculateMissingPrincipal(
      numericValues.finalAmount!,
      numericValues.rate!,
      numericValues.time!,
      numericValues.frequency
    );
    setValues(prev => ({ ...prev, principal: formatResult(result, resultField) }));
  } else if (solveFor === 'finalAmount') {
    result = calculateMissingFinalAmount(
      numericValues.principal!,
      numericValues.rate!,
      numericValues.time!,
      numericValues.frequency
    );
    setValues(prev => ({ ...prev, finalAmount: formatResult(result, resultField) }));
  } else if (solveFor === 'rate') {
    result = calculateMissingRate(
      numericValues.principal!,
      numericValues.finalAmount!,
      numericValues.time!,
      numericValues.frequency
    );
    setValues(prev => ({ ...prev, rate: formatResult(result, resultField) }));
  } else if (solveFor === 'time') {
    result = calculateMissingTime(
      numericValues.principal!,
      numericValues.finalAmount!,
      numericValues.rate!,
      numericValues.frequency
    );
    setValues(prev => ({ ...prev, time: formatResult(result, resultField) }));
  } else {
    throw new Error(`Invalid solve for parameter: ${solveFor}`);
  }

  // Prepare calculation data for database
  const calculationData = {
    principal: parseFloat(values.principal || result?.toString() || "0"),
    rate: parseFloat(values.rate || result?.toString() || "0"),
    time: parseFloat(values.time || result?.toString() || "0"),
    frequency: values.frequency,
    final_amount: parseFloat(values.finalAmount || result?.toString() || "0"),
    solve_for: solveFor,
    created_at: new Date().toISOString()
  };

  // Convert from database format to app format for the onCalculate callback
  const appFormatData = {
    principal: calculationData.principal,
    rate: calculationData.rate,
    time: calculationData.time,
    frequency: calculationData.frequency,
    finalAmount: calculationData.final_amount
  };

  // Save to local history
  onCalculate(appFormatData, solveFor);

  // Save to Supabase database
  try {
    const { error } = await supabase
      .from("calculations")
      .insert([calculationData]);
    
    if (error) {
      console.error('Failed to save calculation to database:', error);
      showToast("Database Error", `Could not save to database: ${error.message}`, "destructive");
    } else {
      showToast("Calculation Complete", `The missing value has been calculated: ${formatResult(result, resultField!)}`);
    }
  } catch (error) {
    console.error('Failed to save calculation to database:', error);
    showToast("Error", "There was an error saving your calculation.", "destructive");
  }
}
