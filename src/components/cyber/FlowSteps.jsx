const steps = [
  { num: '01', label: 'Choose Event' },
  { num: '02', label: 'Register' },
  { num: '03', label: 'Sign Contract' },
  { num: '04', label: 'AI Interview' },
  { num: '05', label: 'Confirmed' },
];

export default function FlowSteps() {
  return (
    <div className="flex justify-center items-center flex-wrap gap-0 mb-12 font-mono text-[10px] tracking-[2px]">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center">
          <div className={`flex flex-col items-center gap-1.5 ${i === 0 ? 'text-fire-4' : 'text-fire-3/30'}`}>
            <div className={`w-8 h-8 border flex items-center justify-center font-orbitron text-[11px] font-bold ${i === 0 ? 'border-fire-3 text-fire-5 bg-fire-3/10 shadow-[0_0_12px_rgba(255,100,0,0.4)]' : 'border-fire-3/25 text-fire-3/30'}`}
              style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
            >
              {step.num}
            </div>
            <span className="text-center text-[9px]">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="w-10 h-[1px] bg-gradient-to-r from-fire-3/20 to-fire-3/40 mx-1 mb-5 mt-0" />
          )}
        </div>
      ))}
    </div>
  );
}