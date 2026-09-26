import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="panel mx-auto max-w-lg p-10 text-center">
      <div className="font-mono text-sm text-brand-400">404 · REJECTED</div>
      <h1 className="mt-2 text-2xl font-semibold text-white">This credential doesn’t match any section</h1>
      <p className="mt-2 text-sm text-slate-400">The page you’re looking for isn’t part of the blueprint explorer.</p>
      <Link to="/" className="mt-6 inline-block rounded-lg bg-brand-400 px-4 py-2 text-sm font-semibold text-canvas hover:bg-brand-300">
        Back to overview
      </Link>
    </div>
  );
}
