import { StudioHeader } from "@/components/studio/studio-header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl">
      <StudioHeader />
      {children}
    </div>
  );
}
