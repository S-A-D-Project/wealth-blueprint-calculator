
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CompoundingFrequency } from "@/utils/calculatorUtils";
import { useMissingValueCalculator, SolveFor } from "@/hooks/use-missing-value-calculator";
import { performCalculation } from "@/utils/calculate-missing-value";
import { SolveForSelect } from "@/components/calculator/SolveForSelect";
import { InputField, FrequencySelect } from "@/components/calculator/CalculatorField";

interface MissingValueCalculatorProps {
  onCalculate: (params: {
    principal: number;
    rate: number;
    time: number;
    frequency: CompoundingFrequency;
    finalAmount: number;
  }, solveFor: SolveFor) => void;
  solveFor: SolveFor;
  setSolveFor: (solveFor: SolveFor) => void;
}

export function MissingValueCalculator({ onCalculate, solveFor, setSolveFor }: MissingValueCalculatorProps) {
  const { values, handleChange, handleFrequencyChange, resetFields, setValues } = useMissingValueCalculator(solveFor);
  const { toast } = useToast();

  const handleSolveForChange = (value: SolveFor) => {
    setSolveFor(value);
    // Optionally clear the field to be solved for
    setValues(prev => ({ ...prev, [value]: "" }));
  };

  const calculateMissingValue = async () => {
    performCalculation(
      values, 
      solveFor, 
      setValues, 
      onCalculate, 
      (title, description, variant = "default") => {
        toast({
          title,
          description: description.startsWith("<code") 
            ? <code style={{ whiteSpace: 'pre-wrap' }}>{description.replace(/<\/?code[^>]*>/g, '')}</code>
            : description,
          variant
        });
      }
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Compute Missing Value</CardTitle>
        <CardDescription>
          Select which value you want to calculate, then fill in the other fields.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); calculateMissingValue(); }}>
          <SolveForSelect value={solveFor} onChange={handleSolveForChange} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Principal Amount"
              name="principal"
              value={values.principal}
              onChange={handleChange}
              placeholder="Enter principal"
              disabled={solveFor === 'principal'}
              step="100"
              prefix="₱"
            />
            
            <InputField
              label="Annual Interest Rate"
              name="rate"
              value={values.rate}
              onChange={handleChange}
              placeholder="Enter rate"
              disabled={solveFor === 'rate'}
              suffix="%"
            />
            
            <InputField
              label="Time Period (Years)"
              name="time"
              value={values.time}
              onChange={handleChange}
              placeholder="Enter time"
              disabled={solveFor === 'time'}
            />
            
            <InputField
              label="Future Value"
              name="finalAmount"
              value={values.finalAmount}
              onChange={handleChange}
              placeholder="Enter future value"
              disabled={solveFor === 'finalAmount'}
              step="100"
              prefix="₱"
            />
            
            <FrequencySelect 
              value={values.frequency} 
              onChange={handleFrequencyChange} 
            />
          </div>
          
          <div className="flex gap-4">
            <Button 
              type="submit" 
              className="flex-1 finance-btn"
            >
              Calculate Missing Value
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={resetFields}
            >
              Reset All Fields
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
