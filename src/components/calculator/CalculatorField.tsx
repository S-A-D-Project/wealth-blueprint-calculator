
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompoundingFrequency } from "@/utils/calculatorUtils";

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  disabled?: boolean;
  type?: string;
  min?: string;
  step?: string;
  prefix?: string;
  suffix?: string;
}

export function InputField({ 
  label,
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
  type = "number",
  min = "0",
  step = "0.01",
  prefix,
  suffix
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {prefix}
          </span>
        )}
        <Input
          id={name}
          name={name}
          type={type}
          min={min}
          step={step}
          value={value}
          onChange={onChange}
          className={`finance-input ${prefix ? "pl-7" : ""} ${suffix ? "pr-7" : ""}`}
          placeholder={placeholder}
          disabled={disabled}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

interface FrequencySelectProps {
  value: CompoundingFrequency;
  onChange: (value: string) => void;
}

export function FrequencySelect({ value, onChange }: FrequencySelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="frequency">Compounding Frequency</Label>
      <Select 
        value={value} 
        onValueChange={onChange}
      >
        <SelectTrigger id="frequency">
          <SelectValue placeholder="Select frequency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="annually">Annually</SelectItem>
          <SelectItem value="semi-annually">Semi-Annually</SelectItem>
          <SelectItem value="quarterly">Quarterly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="continuously">Continuously</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
