//\Atxgitclone\atxbuild\app\admindashboard\jobapplication\[id]\page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import ApplicantProfileModal from "@/components/Admin/jobadmin/viewprofilemodal";

export default function ApplicantProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  return (
    <ApplicantProfileModal
      isOpen={true}
      applicantId={id as string}
      onClose={() => router.back()}
    />
  );
}
