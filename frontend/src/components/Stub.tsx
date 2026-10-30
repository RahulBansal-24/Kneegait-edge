export default function Stub({ title, note }: { title: string; note: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 max-w-prose text-muted">{note}</p>
    </div>
  );
}
