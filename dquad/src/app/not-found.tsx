import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-x flex min-h-dvh flex-col items-center justify-center gap-4 text-center">
      <h1 className="display-lg">That page wandered off.</h1>
      <p className="lede max-w-[44ch]">The Squad prototype only has a few doors. Try the landing page or one of the demo portals.</p>
      <Link href="/" className="btn-grass">Back to the Squad</Link>
    </main>
  );
}
