"use client";

import { useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { Footer } from "./footer";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function MainLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const showSidebar = pathname !== "/";

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        onMenuToggle={showSidebar ? () => setSheetOpen(true) : undefined}
      />
      <div className="flex flex-1">
        {showSidebar && <Sidebar className="hidden md:flex" />}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <Footer />
      {showSidebar && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent>
            <Sidebar onNavClick={() => setSheetOpen(false)} />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
