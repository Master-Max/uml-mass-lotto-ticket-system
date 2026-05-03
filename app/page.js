import Link from "next/link";

export default function Home() {
  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold mb-6">
        Mass Lotto Inventory System
      </h1>

      <Link href="/login" className="text-blue-600 underline">
        Go to Login
      </Link>
    </div>
  );
}