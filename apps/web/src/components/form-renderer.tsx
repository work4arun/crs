"use client";

import { useState } from "react";
import { FormField } from "./form-builder";

interface FormRendererProps {
    schema: FormField[];
    onChange?: (data: Record<string, unknown>) => void;
    onSubmit: (data: Record<string, unknown>) => void;
    submitLabel?: string;
}

export function FormRenderer({ schema, onSubmit, onChange, submitLabel = "Submit", hideSubmit = false, noFormTag = false }: FormRendererProps & { hideSubmit?: boolean; noFormTag?: boolean }) {
    const [formData, setFormData] = useState<Record<string, unknown>>({});

    const handleChange = (id: string, value: string | number | File | undefined) => {
        const updated = { ...formData, [id]: value };
        setFormData(updated);
        if (onChange) onChange(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!schema || schema.length === 0) {
        return <div className="text-gray-500 italic">No form defined.</div>;
    }

    const Content = (
        <div className="space-y-4">
            {schema.map((field) => (
                <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>

                    {field.type === "text" && (
                        <input
                            type="text"
                            required={field.required}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        />
                    )}

                    {field.type === "number" && (
                        <input
                            type="number"
                            required={field.required}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        />
                    )}

                    {field.type === "date" && (
                        <input
                            type="date"
                            required={field.required}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        />
                    )}

                    {field.type === "file" && (
                        <input
                            type="file"
                            required={field.required}
                            onChange={(e) => handleChange(field.id, e.target.files?.[0])}
                            className="mt-1 block w-full text-sm text-gray-500
                 file:mr-4 file:py-2 file:px-4
                 file:rounded-full file:border-0
                 file:text-sm file:font-semibold
                 file:bg-indigo-50 file:text-indigo-700
                 hover:file:bg-indigo-100"
                        />
                    )}

                    {field.type === "select" && (
                        <select
                            required={field.required}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        >
                            <option value="">Select an option</option>
                            {field.options?.map((opt, i) => (
                                <option key={i} value={opt}>{opt}</option>
                            ))}
                        </select>
                    )}

                </div>
            ))}
            {!hideSubmit && (
                <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                    {submitLabel}
                </button>
            )}
        </div>
    );

    if (noFormTag) {
        return Content;
    }

    return (
        <form onSubmit={handleSubmit}>
            {Content}
        </form>
    );
}
