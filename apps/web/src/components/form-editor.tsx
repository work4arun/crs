"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FormBuilder, FormField } from "./form-builder";
import { useAuth } from "@/context/auth-context";

interface FormEditorProps {
    subParameterId: string;
    subParameterName: string;
    onClose: () => void;
}

export function FormEditor({ subParameterId, subParameterName, onClose }: FormEditorProps) {
    const [loading, setLoading] = useState(true);
    const [initialSchema, setInitialSchema] = useState<FormField[]>([]);
    const [formId, setFormId] = useState<string | null>(null);
    const { token } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const storedToken = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token || storedToken}` };

                // Fetch sub-parameter to see if it has a form
                const response = await axios.get(`http://localhost:3001/sub-parameters/${subParameterId}`, { headers });

                if (response.data.formTemplate) {
                    setFormId(response.data.formTemplate.id);
                    // Parse schema if it's stored as JSON string, otherwise use directly
                    const schema = typeof response.data.formTemplate.schema === 'string'
                        ? JSON.parse(response.data.formTemplate.schema)
                        : response.data.formTemplate.schema;
                    setInitialSchema(schema || []);
                }
            } catch (err: unknown) {
                console.error("Failed to fetch form", err);
                setError("Failed to load existing form configuration.");
            } finally {
                setLoading(false);
            }
        };

        fetchForm();
    }, [subParameterId, token]);

    const handleSave = async (schema: FormField[]) => {
        try {
            setLoading(true);
            const storedToken = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token || storedToken}` };
            const name = `${subParameterName} Form`;

            if (formId) {
                // Update existing
                await axios.patch(`http://localhost:3001/forms/${formId}`, {
                    name,
                    schema,
                }, { headers });
            } else {
                // Create new
                await axios.post(`http://localhost:3001/forms`, {
                    name,
                    schema,
                    subParameterId,
                }, { headers });
            }
            onClose();
        } catch (err: unknown) {
            console.error("Failed to save form", err);
            const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
            setError(errorObj.response?.data?.message || "Failed to save form");
            setLoading(false);
        }
    };

    if (loading && !initialSchema.length) return <div className="p-4">Loading...</div>;

    return (
        <div>
            {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}
            <FormBuilder
                initialSchema={initialSchema}
                onSave={handleSave}
                onCancel={onClose}
            />
        </div>
    );
}
