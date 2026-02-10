"use client";

import { withAuth } from "@/components/with-auth";
import { StudentUpload } from "@/components/student-upload";
import { StudentList } from "@/components/student-list";

function StudentsPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Student Master Database</h1>
            <StudentUpload />
            <StudentList />
        </div>
    );
}

export default withAuth(StudentsPage);
