import CreateAdminForm from "@/components/Admin/multipleadmincreationform/admindashboard";

export default function SuperAdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-800">
          SuperadminDashboard
        </h1>

        {/* Create Admin Form */}
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 mb-8">
          <CreateAdminForm />
        </div>

        
        
      </div>
    </div>
  );
}
