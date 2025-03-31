import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { useWeb3 } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';
import { ethers } from 'ethers';

// Form schema for policy creation
const policyFormSchema = z.object({
  location: z.string().min(1, { message: 'Please select a location' }),
  eventType: z.string().min(1, { message: 'Please select an event type' }),
  threshold: z.number().min(1, { message: 'Threshold must be greater than 0' }),
  coverage: z.number().min(0.1, { message: 'Coverage must be at least 0.1 ETH' })
    .max(10, { message: 'Coverage must be less than 10 ETH' }),
  duration: z.number().min(1, { message: 'Please select a duration' }),
});

type PolicyFormValues = z.infer<typeof policyFormSchema>;

export default function PolicyForm() {
  const { toast } = useToast();
  const { isConnected, account, signer } = useWeb3();
  const [premium, setPremium] = useState(0);
  const [thresholdUnit, setThresholdUnit] = useState('mm');
  
  // Get location and event type options
  const { data: options } = useQuery({
    queryKey: ['/api/options'],
  });
  
  // Form setup
  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      location: '',
      eventType: 'rainfall',
      threshold: 100,
      coverage: 1.0,
      duration: 30,
    },
  });
  
  // Watch form values for premium calculation
  const coverage = form.watch('coverage');
  const duration = form.watch('duration');
  const eventType = form.watch('eventType');
  
  // Update premium when coverage or duration changes
  useEffect(() => {
    // Simple premium calculation
    const calculatedPremium = (coverage * 0.05) * (duration / 30);
    setPremium(Number(calculatedPremium.toFixed(3)));
  }, [coverage, duration]);
  
  // Update threshold unit based on event type
  useEffect(() => {
    switch (eventType) {
      case 'rainfall':
        setThresholdUnit('mm');
        break;
      case 'drought':
        setThresholdUnit('days');
        break;
      case 'heatwave':
        setThresholdUnit('°C');
        break;
      case 'storm':
        setThresholdUnit('km/h');
        break;
      default:
        setThresholdUnit('mm');
    }
  }, [eventType]);
  
  // Mutation for creating policy
  const createPolicyMutation = useMutation({
    mutationFn: async (formData: PolicyFormValues) => {
      if (!account || !signer) {
        throw new Error('Wallet not connected');
      }
      
      // Send ETH from user's wallet to simulate contract interaction
      // In a real implementation, this would be a call to an actual smart contract
      try {
        // Convert premium to wei
        const premiumWei = ethers.parseEther(premium.toString());
        
        // Simulate transaction - in a real app this would be a contract call
        const tx = await signer.sendTransaction({
          to: ethers.ZeroAddress, // This would be the contract address in production
          value: premiumWei,
        });
        
        // Wait for transaction to be mined
        await tx.wait();
        
        // Calculate policy dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + formData.duration);
        
        // Create policy record in backend
        const policyData = {
          walletAddress: account,
          location: formData.location,
          eventType: formData.eventType,
          threshold: formData.threshold,
          coverage: formData.coverage,
          premium: premium,
          duration: formData.duration,
          startDate: startDate,
          endDate: endDate,
          status: 'active',
          currentValue: 0,
          txHash: tx.hash,
        };
        
        const response = await apiRequest('POST', '/api/policies', policyData);
        const policy = await response.json();
        
        // Create transaction record
        await apiRequest('POST', '/api/transactions', {
          walletAddress: account,
          type: 'policy_created',
          amount: premium,
          txHash: tx.hash,
          timestamp: new Date(),
          policyId: policy.id,
          details: { policy: policyData }
        });
        
        return policy;
      } catch (error) {
        console.error('Transaction error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Policy Created',
        description: 'Your insurance policy has been created successfully',
      });
      
      form.reset({
        location: '',
        eventType: 'rainfall',
        threshold: 100,
        coverage: 1.0,
        duration: 30,
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/policies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Create Policy',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (values: PolicyFormValues) => {
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to purchase a policy',
        variant: 'destructive',
      });
      return;
    }
    
    createPolicyMutation.mutate(values);
  };
  
  return (
    <Card className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden mb-8">
      <CardHeader className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
        <CardTitle className="text-lg font-medium text-neutral-900">Create New Policy</CardTitle>
        <CardDescription className="text-sm text-neutral-600">
          Get insurance against weather events in your selected location
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Location Selection */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Location</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-md border border-neutral-300 py-2.5 pl-3 pr-10 text-neutral-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Placeholder handled by SelectValue above */}
                      {options?.locations?.map((location: { id: string, name: string }) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            {/* Weather Event Type */}
            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Weather Event Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-2 gap-3"
                    >
                      {options?.weatherEventTypes?.map((eventType: { id: string, name: string }) => (
                        <FormItem key={eventType.id} className="relative flex items-center space-x-3">
                          <FormControl>
                            <RadioGroupItem value={eventType.id} id={`event-${eventType.id}`} />
                          </FormControl>
                          <FormLabel htmlFor={`event-${eventType.id}`} className="ml-2 font-medium text-sm text-neutral-700">
                            {eventType.name}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Coverage Threshold */}
            <FormField
              control={form.control}
              name="threshold"
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">
                    Threshold ({eventType === 'rainfall' ? 'Rainfall >' : eventType === 'drought' ? 'Days without rain >' : eventType === 'heatwave' ? 'Temperature >' : 'Wind speed >'} {value}{thresholdUnit})
                  </FormLabel>
                  <div className="flex items-center">
                    <Slider
                      value={[value]}
                      min={eventType === 'rainfall' ? 50 : eventType === 'drought' ? 10 : eventType === 'heatwave' ? 30 : 20}
                      max={eventType === 'rainfall' ? 200 : eventType === 'drought' ? 60 : eventType === 'heatwave' ? 50 : 100}
                      step={eventType === 'rainfall' ? 10 : eventType === 'drought' ? 5 : eventType === 'heatwave' ? 1 : 5}
                      onValueChange={([newValue]) => onChange(newValue)}
                      className="w-full"
                    />
                    <span className="ml-3 text-neutral-700 font-medium">
                      {value}{thresholdUnit}
                    </span>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              {/* Coverage Amount */}
              <FormField
                control={form.control}
                name="coverage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">Coverage Amount (ETH)</FormLabel>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="10"
                          className="block w-full pr-12 rounded-md border border-neutral-300 py-2.5 pl-3 text-neutral-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-neutral-500 sm:text-sm">ETH</span>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              
              {/* Duration */}
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">Duration</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-md border border-neutral-300 py-2.5 pl-3 pr-10 text-neutral-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {options?.policyDurations?.map((duration: { days: number, name: string }) => (
                          <SelectItem key={duration.days} value={duration.days.toString()}>
                            {duration.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            
            {/* Premium Calculation */}
            <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-neutral-600">Premium</span>
                  <p className="text-lg font-semibold text-neutral-900">{premium} ETH</p>
                </div>
                <div>
                  <span className="text-sm text-neutral-600">Potential Payout</span>
                  <p className="text-lg font-semibold text-neutral-900">{coverage} ETH</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={createPolicyMutation.isPending || !isConnected}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {createPolicyMutation.isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                      <path d="M9 12H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-4"></path>
                      <path d="M9 12V7a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v5"></path>
                      <line x1="9" y1="17" x2="15" y2="17"></line>
                    </svg>
                    Purchase Policy
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
