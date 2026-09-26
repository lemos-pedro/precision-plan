import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { UiTower } from "@/lib/api-adapters";
import type { SiteAssetId } from "./types";

const SiteScene = lazy(() => import("./SiteScene"));

function Fallback() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-data-grid text-xs text-muted-foreground">
      A preparar visualização 3D do site…
    </div>
  );
}

export function Site3DView({
  torre,
  selected,
  onSelect,
  className,
}: {
  torre: UiTower;
  selected: SiteAssetId | null;
  onSelect: (id: SiteAssetId) => void;
  className?: string;
}) {
  return (
    <div className={className ?? "h-[460px] w-full"}>
      <ClientOnly fallback={<Fallback />}>
        <Suspense fallback={<Fallback />}>
          <SiteScene torre={torre} selected={selected} onSelect={onSelect} />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
