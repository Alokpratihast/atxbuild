// components/jobseekerdasboard/SettingsForm.tsx
"use client";

export default function SettingsForm() {
  return (
    <form className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium">Notification Preferences</label>
        <select className="w-full p-2 border rounded-lg">
          <option>Email</option>
          <option>SMS</option>
          <option>Push Notification</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Privacy</label>
        <select className="w-full p-2 border rounded-lg">
          <option>Public</option>
          <option>Private</option>
        </select>
      </div>
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Save Settings
      </button>
    </form>
  );
}
