import Image from 'next/image';
import Link from 'next/link';

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <Image
        src="/logo.jpg"
        alt="Lodhi Connect"
        width={48}
        height={48}
        className="h-12 w-12 rounded-full object-cover"
        priority
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