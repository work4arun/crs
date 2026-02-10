"use client";

import { useState } from "react";
import { withAuth } from "@/components/with-auth";
import { ParameterForm } from "@/components/parameter-form";
import { ParameterList } from "@/components/parameter-list";

function ParametersPage() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleSuccess = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Scoring Framework</h1>
            <ParameterForm onSuccess={handleSuccess} />
            <ParameterList refreshTrigger={refreshTrigger} />
        </div>
    );
}

export default withAuth(ParametersPage);
