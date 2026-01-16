export const FullPageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
          Menyiapkan data...
        </p>
      </div>
    </div>
  );
};