interface MicButtonProps {
  onClick: () => void;
  disabled: boolean;
  isProcessing: boolean;
}

export function MicButton({ onClick, disabled, isProcessing }: MicButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-6 py-3 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 text-white font-semibold text-base transition-all duration-150 shadow-[0_10px_30px_rgba(56,189,248,0.35)] hover:shadow-[0_14px_40px_rgba(56,189,248,0.45)] hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] active:shadow-[0_6px_20px_rgba(56,189,248,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_10px_30px_rgba(56,189,248,0.35)]"
    >
      {isProcessing ? "Listening..." : "Talk to Jarvis"}
    </button>
  );
}
