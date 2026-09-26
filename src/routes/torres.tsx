import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/torres")({
  component: TorresLayout,
});

function TorresLayout() {
  return <Outlet />;
}
