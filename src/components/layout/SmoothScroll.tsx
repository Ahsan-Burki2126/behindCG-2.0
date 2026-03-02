"use client";

import { useSmoothScroll } from "@/hooks/useSmoothScroll";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useSmoothScroll();

  return <>{children}</>;
}
