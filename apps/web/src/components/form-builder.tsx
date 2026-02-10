"use client";

import { useState } from "react";

export interface FormField {
    id: string;
    label: string;
    type: "text" | "number" | "date" | "file" | "select";
    required: boolean;
    options?: string[]; // For select type
}

interface FormBuilderProps {
    initialSchema?: FormField[];
    onSave: (schema: FormField[]) => void;
    onCancel: () => void;
}

export function FormBuilder({ initialSchema = [], onSave, onCancel }: FormBuilderProps) {
    const [fields, setFields] = useState<FormField[]>(initialSchema);

    const addField = () => {
        const newField: FormField = {
            id: Date.now().toString(),
            label: "New Field",
            type: "text",
            required: true,
        };
        setFields([...fields, newField]);
    };

    const removeField = (index: number) => {
        const newFields = [...fields];
        newFields.splice(index, 1);
        setFields(newFields);
    };

    const updateField = (index: number, key: keyof FormField, value: string | number | boolean | string[]) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], [key]: value };
        setFields(newFields);
    };

    const handleOptionChange = (index: number, value: string) => {
        const options = value.split(',').map(o => o.trim());
        updateField(index, 'options', options);
    }

    return (
        <div className="bg-gray-50 p-4 rounded border border-gray-300 mt-4">
            <h3 className="text-lg font-semibold mb-4">Design Form</h3>

            {fields.length === 0 && (
                <div className="text-center text-gray-500 py-4 italic">
                    No fields added. Click &quot;Add Field&quot; to start.
                </div>
            )}

            <div className="space-y-4 mb-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start bg-white p-3 rounded shadow-sm border">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500">Label</label>
                            <input
                                type="text"
                                value={field.label}
                                onChange={(e) => updateField(index, "label", e.target.value)}
                                className="block w-full text-sm rounded-md border-gray-300 border p-1"
                            />
                        </div>
                        <div className="w-32">
                            <label className="block text-xs font-medium text-gray-500">Type</label>
                            <select
                                value={field.type}
                                onChange={(e) => updateField(index, "type", e.target.value)}
                                className="block w-full text-sm rounded-md border-gray-300 border p-1"
                            >
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="date">Date</option>
                                <option value="file">File Upload</option>
                                <option value="select">Dropdown</option>
                            </select>
                        </div>

                        {field.type === 'select' && (
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-500">Options (comma separated)</label>
                                <input
                                    type="text"
                                    value={field.options?.join(', ') || ''}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    className="block w-full text-sm rounded-md border-gray-300 border p-1"
                                    placeholder="Option 1, Option 2"
                                />
                            </div>
                        )}

                        <div className="flex items-center pt-5">
                            <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateField(index, "required", e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">Req</label>
                        </div>
                        <div className="pt-4">
                            <button
                                onClick={() => removeField(index)}
                                className="text-red-500 hover:text-red-700 font-bold"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between">
                <button
                    onClick={addField}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    + Add Field
                </button>
                <div className="space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(fields)}
                        className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm hover:bg-indigo-700"
                    >
                        Save Form
                    </button>
                </div>
            </div>
        </div>
    );
}
