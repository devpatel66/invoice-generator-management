export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="relative flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 shadow-lg" />
        <span className="absolute text-xs text-gray-600 top-14 animate-pulse">Loading...</span>
      </div>
    </div>
  );
}
