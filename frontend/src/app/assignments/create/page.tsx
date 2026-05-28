'use client';

import SidebarLayout from '@/components/layout/SidebarLayout';
import AssignmentCreateForm from '@/components/assignment/AssignmentCreateForm';

export default function CreateAssignmentPage() {
  return (
    <SidebarLayout breadcrumb="Create Assignment">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Assignment</h1>
          <p className="text-sm text-gray-500 mt-2">
            Set up the assignment details, upload any supporting files, and generate the paper.
          </p>
        </div>
        <AssignmentCreateForm />
      </div>
    </SidebarLayout>
  );
}
