interface LogPanelProps {
  log: string
}

export function LogPanel({ log }: LogPanelProps) {
  return (
    <p className="min-h-[1.5rem] max-w-[480px] text-center text-slate-400">
      {log}
    </p>
  )
}
