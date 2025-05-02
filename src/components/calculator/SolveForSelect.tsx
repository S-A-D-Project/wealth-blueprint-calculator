
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SolveFor } from "@/hooks/use-missing-value-calculator";

export const solveOptions = [
  { value: 'principal', label: 'Principal (P)' },
  { value: 'rate', label: 'Annual Interest Rate (r)' },
  { value: 'time', label: 'Time Period (t)' },
  { value: 'finalAmount', label: 'Future Value (A)' },
];

interface SolveForSelectProps {
  value: SolveFor;
  onChange: (value: SolveFor) => void;
}

export function SolveForSelect({ value, onChange }: SolveForSelectProps) {
  return (
    <div className="mb-4">
      <Label htmlFor="solveFor">I want to calculate:</Label>
      <Select 
        value={value} 
        onValueChange={(val) => onChange(val as SolveFor)}
      >
        <SelectTrigger id="solveFor">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {solveOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
