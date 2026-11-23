import { Suspense } from "react";
import { AuthPageContent } from "@/components/auth/AuthPageContent";

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ywd-cream" />}>
      <AuthPageContent />
    </Suspense>
  );
}
