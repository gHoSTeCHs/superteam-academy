"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef, HTMLAttributes } from "react";

type SheetProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Root>;

export function Sheet({ ...props }: SheetProps) {
  return <DialogPrimitive.Root {...props} />;
}

type SheetTriggerProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Trigger
>;

export function SheetTrigger({ ...props }: SheetTriggerProps) {
  return <DialogPrimitive.Trigger {...props} />;
}

type SheetCloseProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Close>;

export function SheetClose({ ...props }: SheetCloseProps) {
  return <DialogPrimitive.Close {...props} />;
}

type SheetOverlayProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Overlay
>;

function SheetOverlay({ className, ...props }: SheetOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80",
        className,
      )}
      {...props}
    />
  );
}

type SheetContentProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
>;

export function SheetContent({
  className,
  children,
  ...props
}: SheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      <SheetOverlay />
      <DialogPrimitive.Content
        className={cn(
          "bg-card data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left fixed inset-y-0 left-0 z-50 w-72 border-r border-border shadow-lg duration-300",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function SheetHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-2 p-4", className)} {...props} />
  );
}

type SheetTitleProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Title>;

export function SheetTitle({ className, ...props }: SheetTitleProps) {
  return (
    <DialogPrimitive.Title
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

type SheetDescriptionProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Description
>;

export function SheetDescription({
  className,
  ...props
}: SheetDescriptionProps) {
  return (
    <DialogPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}
