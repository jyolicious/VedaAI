import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col h-screen w-screen items-center justify-center bg-slate-50 text-center px-4">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h2>
      <p className="text-slate-500 mb-6">Could not find requested resource.</p>
      <Link 
        href="/assignments" 
        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
      >
        Return to Assignments
      </Link>
    </div>
  );
}