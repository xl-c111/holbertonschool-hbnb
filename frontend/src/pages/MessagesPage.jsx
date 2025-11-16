import { Navigation } from "@/components/navigation";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="pt-28 pb-16 px-6 max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500 text-sm uppercase tracking-[0.3em]">
            <MessageSquare className="w-4 h-4" />
            Messages
          </div>
          <h1 className="text-4xl font-light">Inbox</h1>
          <p className="text-gray-600">Future space for guest-host conversations and booking updates.</p>
        </header>

        <div className="bg-white border border-gray-200 rounded-3xl p-6">
          <p className="text-lg font-medium mb-2">Messaging system not live yet</p>
          <p className="text-sm text-gray-600">
            This placeholder makes the navigation functional while you implement real-time messaging or email
            notifications later.
          </p>
        </div>
      </main>
    </div>
  );
}
