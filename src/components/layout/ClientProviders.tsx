"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ContentProvider } from "@/lib/ContentContext";

const Navbar = dynamic(() => import("@/components/layout/Navbar"), {
  ssr: false,
});
const CustomCursor = dynamic(() => import("@/components/ui/CustomCursor"), {
  ssr: false,
});
const SmoothScroll = dynamic(() => import("@/components/layout/SmoothScroll"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/components/layout/Footer"));
const InteractiveParticles = dynamic(
  () => import("@/components/layout/InteractiveParticles"),
  {
    ssr: false,
  },
);

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <ContentProvider>{children}</ContentProvider>;
  }

  return (
    <ContentProvider>
      <InteractiveParticles />
      <CustomCursor />
      <Navbar />
      <SmoothScroll>
        <main>{children}</main>
        <Footer />
      </SmoothScroll>
    </ContentProvider>
  );
}
