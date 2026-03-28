export default function TipCallout({ tip }: { tip: string }) {
  return (
    <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex gap-2.5 text-sm text-amber-900 leading-relaxed">
      <span className="text-base flex-shrink-0 mt-0.5">💡</span>
      <p>{tip}</p>
    </div>
  );
}
