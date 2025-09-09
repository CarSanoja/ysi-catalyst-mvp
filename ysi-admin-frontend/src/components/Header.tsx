interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="w-full bg-slate-900 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-white">
            <span className="font-medium">World Economic Forum</span>
            <span className="text-slate-400">·</span>
            <span className="font-medium">Schwab Foundation</span>
            <span className="text-slate-400">·</span>
            <span className="font-medium">Global Shapers</span>
          </div>
        </div>
        {children}
      </div>
    </header>
  );
}