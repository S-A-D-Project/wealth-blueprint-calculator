import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CalculationParams, 
  deleteCalculation,
  formatCurrency,
  CompoundingFrequency
} from "@/utils/calculatorUtils";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { CalculationHistory as CalculationHistoryType } from "@/utils/calculatorUtils";
import type { Tables } from "@/integrations/supabase/database.types";

interface HistoryProps {
  onSelectHistory: (params: CalculationParams) => void;
}

type DatabaseCalculation = Tables["calculations"];

export function CalculationHistory({ onSelectHistory }: HistoryProps) {
  const [history, setHistory] = useState<CalculationHistoryType[]>([]);
  const [selectedItem, setSelectedItem] = useState<CalculationHistoryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      // Fetch calculations from Supabase
      const { data, error } = await supabase
        .from('calculations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform database results to match the CalculationHistoryType
      const formattedHistory = (data || []).map((item: DatabaseCalculation) => ({
        id: item.id.toString(),
        principal: item.principal,
        rate: item.rate,
        time: item.time,
        frequency: item.frequency as CompoundingFrequency,
        finalAmount: item.final_amount,
        totalInterest: item.final_amount - item.principal,
        yearlyBreakdown: [],
        formula: calculateFormula(item.frequency as CompoundingFrequency),
        createdAt: item.created_at
      }));

      setHistory(formattedHistory);
    } catch (error) {
      console.error('Error fetching calculation history:', error);
      toast({
        title: "Failed to load history",
        description: "Could not fetch calculations from the database.",
        variant: "destructive"
      });
      
      // Fallback to local storage
      const localHistory = localStorage.getItem('calculationHistory');
      setHistory(localHistory ? JSON.parse(localHistory) : []);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFormula = (frequency: CompoundingFrequency): string => {
    if (frequency === 'continuously') {
      return 'A = P × e^(rt)';
    }
    return 'A = P(1 + r/n)^(nt)';
  };

  const handleDelete = async (id: string) => {
    try {
      // Delete from database
      const { error } = await supabase
        .from('calculations')
        .delete()
        .eq('id', parseInt(id));

      if (error) {
        throw error;
      }

      // Update local state
      setHistory(prev => prev.filter(item => item.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }

      toast({
        title: "Calculation deleted",
        description: "The calculation has been removed from history."
      });
    } catch (error) {
      console.error('Error deleting calculation:', error);
      toast({
        title: "Delete failed",
        description: "Could not delete the calculation.",
        variant: "destructive"
      });
    }
  };

  const handleClearAll = async () => {
    try {
      // Clear all calculations from database
      const { error } = await supabase
        .from('calculations')
        .delete()
        .neq('id', 0); // Delete all records

      if (error) {
        throw error;
      }

      // Update local state
      setHistory([]);
      setSelectedItem(null);
      
      toast({
        title: "History cleared",
        description: "All calculations have been deleted."
      });
    } catch (error) {
      console.error('Error clearing calculations:', error);
      toast({
        title: "Clear failed",
        description: "Could not clear calculation history.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleItemClick = (item: CalculationHistoryType) => {
    setSelectedItem(item);
    onSelectHistory({
      principal: item.principal,
      rate: item.rate,
      time: item.time,
      frequency: item.frequency,
      startDate: null
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Calculation History</CardTitle>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={history.length === 0}>
              Clear All
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your saved calculations.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearAll}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScrollArea className="h-72 rounded-md">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <p>Loading calculations...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No calculation history yet
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div 
                    key={item.id} 
                    className={`border rounded-lg p-4 hover:bg-accent/50 cursor-pointer ${
                      selectedItem?.id === item.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{formatCurrency(item.principal)} invested for {item.time} years</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.rate}% compounded {item.frequency}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <p className="flex gap-2 items-center">
                          <Badge variant="outline" className="text-xs">Final</Badge>
                          {formatCurrency(item.finalAmount)}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          {selectedItem && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Calculation Details</h3>
              <div className="space-y-2">
                <p><strong>Principal:</strong> {formatCurrency(selectedItem.principal)}</p>
                <p><strong>Annual Rate:</strong> {selectedItem.rate}%</p>
                <p><strong>Time Period:</strong> {selectedItem.time} years</p>
                <p><strong>Compounding:</strong> {selectedItem.frequency}</p>
                <p><strong>Final Amount:</strong> {formatCurrency(selectedItem.finalAmount)}</p>
                <p><strong>Total Interest:</strong> {formatCurrency(selectedItem.totalInterest)}</p>
                <p><strong>Formula Used:</strong> {selectedItem.formula}</p>
                <p><strong>Calculated on:</strong> {formatDate(selectedItem.createdAt)}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
