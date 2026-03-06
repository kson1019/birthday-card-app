import Link from "next/link";
import CardList from "@/components/dashboard/CardList";

export default function DashboardPage() {
  return (
    <main className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-purple-700">
            &#127874; Birthday Cards
          </h1>
          <Link
            href="/"
            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            &larr; Create New
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h2>
          <p className="text-gray-500">Track your invitations and RSVPs</p>
        </div>

        <CardList />
      </div>
    </main>
  );
}
