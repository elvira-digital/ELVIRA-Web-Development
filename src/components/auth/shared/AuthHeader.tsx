interface AuthHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthHeader({ icon, title, subtitle }: AuthHeaderProps) {
  return (
    <div className="text-center mb-4 sm:mb-8">
      <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-emerald-500 rounded-full flex items-center justify-center mb-3 sm:mb-6">
        {icon}
      </div>
      <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
        {title}
      </h1>
      <p className="text-xs sm:text-sm text-gray-600">{subtitle}</p>
    </div>
  );
}
