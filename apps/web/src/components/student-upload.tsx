"use client";

import { useState } from "react";
import axios from "axios";
import { API_URL } from "@/config";
import { useAuth } from "@/context/auth-context";

export function StudentUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const { token } = useAuth(); // Assuming useAuth exposes token, if not we need to get it from storage or context

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setMessage("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const storedToken = localStorage.getItem('token'); // Fallback if context doesn't have it directly exposed
            await axios.post(`${API_URL}/students/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token || storedToken}`,
                },
            });
            setMessage("Upload successful!");
            // Optionally trigger release of student list
            window.location.reload();
        } catch (error) {
            console.error(error);
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            setMessage("Upload failed: " + (err.response?.data?.message || err.message || "Unknown error"));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-4 border rounded shadow-sm bg-white">
            <h2 className="text-lg font-semibold mb-4">Bulk Student Upload</h2>
            <div className="flex gap-4 items-center">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100
          "
                />
                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
                >
                    {uploading ? "Uploading..." : "Upload CSV"}
                </button>
            </div>
            {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
        </div>
    );
}
