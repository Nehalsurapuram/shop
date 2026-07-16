import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-28 text-center">
      <p className="text-xs tracking-[0.2em] text-muted uppercase">404</p>
      <h1 className="mt-3 text-xl tracking-[0.14em] uppercase">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-3 text-sm text-muted">
        The link may be broken, or the piece may have sold out.
      </p>
      <Link
        href="/"
        className="mt-8 bg-foreground px-10 py-3.5 text-xs tracking-[0.14em] text-white uppercase"
      >
        Back to home
      </Link>
    </div>
  );
}
