import Image from "next/image";
import { HeartLogo } from "@/components/icons";

export function BrandLogo({ url, size = 36 }: { url: string | null; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-rose-deep"
      style={{ width: size, height: size }}
    >
      {url ? (
        <Image src={url} alt="Ruhh logo" width={size} height={size} className="h-full w-full object-cover" unoptimized />
      ) : (
        <HeartLogo />
      )}
    </div>
  );
}
