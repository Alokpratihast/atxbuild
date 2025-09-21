// app/jobseekerdashboard/settings/page.tsx
import SettingsForm from "@/components/jobseekerdasboard/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Manage your account preferences and privacy.
      </p>

      {/* Settings Form */}
      <SettingsForm />
    </div>
  );
}
