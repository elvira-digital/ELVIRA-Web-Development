interface AuthContainerProps {
  children: React.ReactNode;
}

export function AuthContainer({ children }: AuthContainerProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-6 px-6 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-sm w-full">{children}</div>
    </div>
  );
}
