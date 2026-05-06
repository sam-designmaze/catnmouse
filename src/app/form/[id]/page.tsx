"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/branding/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Send } from "lucide-react";

interface FormField {
  name: string;
  type: string;
  required: boolean;
}

interface FormData {
  id: string;
  name: string;
  fields: FormField[];
}

export default function FormPage({ params }: { params: Promise<{ id: string }> }) {
  const { addToast } = useToast();
  const [formId, setFormId] = useState<string>("");
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const { id } = await params;
      setFormId(id);
    })();
  }, [params]);

  useEffect(() => {
    if (!formId) return;

    const fetchForm = async () => {
      try {
        const res = await fetch(`/api/forms/${formId}`);
        if (!res.ok) throw new Error("Form not found");

        const data = await res.json();
        const fields = JSON.parse(data.fields);
        setForm({ ...data, fields });

        // Initialize form values
        const initial: Record<string, string> = {};
        fields.forEach((field: FormField) => {
          initial[field.name] = "";
        });
        setFormValues(initial);
      } catch (error) {
        addToast("Form not found", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId, addToast]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/forms/${formId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formValues }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to submit form");
      }

      setSubmitted(true);
      addToast("Form submitted successfully!", "success");
      setFormValues({});
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      addToast((error as Error).message || "Failed to submit form", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <GlassCard>
          <p className="text-gray-400">Loading form...</p>
        </GlassCard>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <GlassCard>
          <p className="text-gray-400">Form not found</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <GlassCard>
          <div className="mb-6">
            <h1 className="text-white text-2xl font-bold mb-2">{form.name}</h1>
            <p className="text-gray-400 text-sm">Fill out the form below to submit your information</p>
          </div>

          {submitted && (
            <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-6">
              Thank you for submitting the form!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {form.fields.map((field) => (
              <div key={field.name}>
                <Label htmlFor={field.name}>
                  {field.name}
                  {field.required && <span className="text-red-400">*</span>}
                </Label>

                {field.type === "textarea" ? (
                  <textarea
                    id={field.name}
                    value={formValues[field.name] || ""}
                    onChange={(e) =>
                      setFormValues({ ...formValues, [field.name]: e.target.value })
                    }
                    required={field.required}
                    className="w-full bg-white/8 border border-white/15 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/50 transition-all resize-none h-24"
                    placeholder={`Enter ${field.name.toLowerCase()}`}
                  />
                ) : field.type === "select" ? (
                  <select
                    id={field.name}
                    value={formValues[field.name] || ""}
                    onChange={(e) =>
                      setFormValues({ ...formValues, [field.name]: e.target.value })
                    }
                    required={field.required}
                    className="w-full bg-white/8 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/50 transition-all"
                  >
                    <option value="">Select an option</option>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                  </select>
                ) : field.type === "checkbox" ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formValues[field.name] === "true"}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          [field.name]: e.target.checked ? "true" : "false",
                        })
                      }
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="text-white">{field.name}</span>
                  </label>
                ) : (
                  <Input
                    id={field.name}
                    type={field.type === "email" ? "email" : "text"}
                    value={formValues[field.name] || ""}
                    onChange={(e) =>
                      setFormValues({ ...formValues, [field.name]: e.target.value })
                    }
                    required={field.required}
                    placeholder={`Enter ${field.name.toLowerCase()}`}
                  />
                )}
              </div>
            ))}

            <Button type="submit" disabled={submitting} className="w-full justify-center gap-2">
              <Send size={16} />
              {submitting ? "Submitting..." : "Submit Form"}
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
