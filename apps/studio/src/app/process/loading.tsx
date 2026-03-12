import { SacredSpinner } from "@/components/ui/sacred-spinner";

export default function ProcessLoading() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <SacredSpinner size="lg" />
    </div>
  );
}
