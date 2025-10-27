import { Suspense } from "react";
import ResetPasswordClient from "./clientpage";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading reset form...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
