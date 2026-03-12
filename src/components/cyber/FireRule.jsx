export default function FireRule() {
  return (
    <div className="relative z-10 w-full">
      <div className="h-[1px] bg-gradient-to-r from-transparent via-fire-5 to-transparent" />
      <div className="absolute inset-x-0 -top-[5px] h-[11px] bg-gradient-to-r from-transparent via-fire-5 to-transparent blur-[7px] opacity-50" />
    </div>
  );
}