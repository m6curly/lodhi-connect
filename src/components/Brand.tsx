import Link from 'next/link';

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <img
        src="/logo.JPG"
        alt="Lodhi Connect"
        className="h-10 w-10 rounded-full object-cover"
      />

      <div>
        <div className="font-bold tracking-wide">LODHI CONNECT</div>
        <div className="text-[10px] uppercase tracking-[.18em] muted">
          C2 · D1 Blocks
        </div>
      </div>
    </Link>
  );
}