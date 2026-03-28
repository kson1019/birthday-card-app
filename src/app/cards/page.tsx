import CardCreatorForm from "@/components/forms/CardCreatorForm";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-purple-700">
            &#127874; Birthday Cards
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              &larr; Home
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              Dashboard &rarr;
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Create a Birthday Card
          </h2>
          <p className="text-gray-500">
            Design a beautiful animated card and send it to your guests
          </p>
        </div>

        <CardCreatorForm />
      </div>
    </main>
  );
}
