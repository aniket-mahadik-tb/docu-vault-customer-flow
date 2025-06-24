import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import MainLayout from "@/layouts/MainLayout";

// Promoter schema
const promoterSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string()
    .length(10, { message: "Phone number must be exactly 10 digits" })
    .regex(/^[0-9]+$/, { message: "Phone number must contain only digits" }),
  pan: z.string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: "Please enter a valid PAN Card number (e.g., ABCDE1234F)" }),
});

const promotersFormSchema = z.object({
  promoters: z.array(promoterSchema).min(1, { message: "At least one promoter is required" }),
});

type PromotersFormValues = z.infer<typeof promotersFormSchema>;

const AddPromoter = () => {
  const form = useForm<PromotersFormValues>({
    resolver: zodResolver(promotersFormSchema),
    defaultValues: { promoters: [{ name: "", email: "", phone: "", pan: "" }] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "promoters",
  });

  const onSubmit = (data: PromotersFormValues) => {
    // TODO: Integrate with API or context
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Add Promoters</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {fields.map((field, index) => (
                <Card key={field.id} className="mb-4 relative">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <span className="font-semibold">Promoter {index + 1}</span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                        className="h-8 w-8 p-0"
                        aria-label="Remove promoter"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-medium">Full Name</label>
                      <Input {...form.register(`promoters.${index}.name`)} placeholder="John Smith" />
                      <span className="text-xs text-red-500">{form.formState.errors.promoters?.[index]?.name?.message as string}</span>
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Email</label>
                      <Input {...form.register(`promoters.${index}.email`)} placeholder="john.smith@example.com" type="email" />
                      <span className="text-xs text-red-500">{form.formState.errors.promoters?.[index]?.email?.message as string}</span>
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Phone Number</label>
                      <Input {...form.register(`promoters.${index}.phone`)} placeholder="9876543210" maxLength={10} />
                      <span className="text-xs text-red-500">{form.formState.errors.promoters?.[index]?.phone?.message as string}</span>
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">PAN Card Number</label>
                      <Input {...form.register(`promoters.${index}.pan`)} placeholder="ABCDE1234F" onChange={e => form.setValue(`promoters.${index}.pan`, e.target.value.toUpperCase())} />
                      <span className="text-xs text-red-500">{form.formState.errors.promoters?.[index]?.pan?.message as string}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ name: "", email: "", phone: "", pan: "" })}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Add Promoter
                </Button>
              </div>
              <Button type="submit" className="w-full mt-4">Save Promoters</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AddPromoter; 