import { RefreshIcon } from "./icons";

interface RefreshButtonProps {
  onClick: () => void;
  refreshing?: boolean;
}

export function RefreshButton({
  onClick,
  refreshing = false,
}: RefreshButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={refreshing}
      aria-label="รีเฟรช"
      className="flex size-10 shrink-0 items-center justify-center text-zinc-600 disabled:opacity-60"
    >
      <RefreshIcon className={refreshing ? "animate-spin" : ""} />
    </button>
  );
}
