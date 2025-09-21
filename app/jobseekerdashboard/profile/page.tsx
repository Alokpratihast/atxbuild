// app/jobseekerdashboard/profile/page.tsx
import ProfileForm from "@/components/jobseekerdasboard/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Update your personal information and career details.
      </p>

      <ProfileForm />
      
    </div>
  );
}
