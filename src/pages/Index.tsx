
import { useState } from "react";
import { Layout } from "@/components/layout";
import { CalculatorForm } from "@/components/calculator-form";
import { ResultsDisplay } from "@/components/results-display";
import { CalculationHistory } from "@/components/calculation-history";
import { CalculationParams } from "@/utils/calculatorUtils";

const Index = () => {
  const [calculationParams, setCalculationParams] = useState<CalculationParams | null>(null);

  const handleCalculate = (params: CalculationParams) => {
    setCalculationParams(params);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-center mb-8">Compound Interest Calculator</h2>
          <p className="text-center text-muted-foreground mb-8">
            Plan your financial future by calculating how your investments will grow over time with the power of compound interest.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <CalculatorForm onCalculate={handleCalculate} />
            {calculationParams && <ResultsDisplay params={calculationParams} />}
          </div>
          
          <div className="md:col-span-1">
            <CalculationHistory onSelectHistory={handleCalculate} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
