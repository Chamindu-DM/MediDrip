import React, { useState } from 'react';

const PRESETS = [50, 100, 150, 200, 250, 500];

function AddFluidModal({ type, onAdd, onClose }) {
  const [amount, setAmount] = useState(200);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const isIntake = type === 'INTAKE';
  const title = isIntake ? 'Add Fluid Intake' : 'Add Fluid Output';
  const icon = isIntake ? (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ) : (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );

  const handleSubmit = () => {
    const finalAmount = isCustom ? parseInt(customAmount) || 0 : amount;
    if (finalAmount > 0) {
      onAdd(finalAmount);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-center modal-overlay z-50"
      onClick={onClose}
    >
      <div
        className="w-96 bg-white rounded-t-2xl p-5 flex flex-col gap-4 modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              isIntake ? 'bg-brand-primary/10 text-brand-primary' : 'bg-black/5 text-black/70'
            }`}>
              {icon}
            </div>
            <h2 className="text-black text-lg font-semibold font-instrument">{title}</h2>
          </div>
          <button
            onClick={onClose}
            id="modal-close-button"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors"
          >
            <svg className="w-5 h-5 text-black/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Preset amounts */}
        <div>
          <span className="text-black/50 text-xs font-medium font-instrument mb-2 block uppercase tracking-wider">
            Quick Select (ml)
          </span>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setAmount(preset);
                  setIsCustom(false);
                  setCustomAmount('');
                }}
                className={`py-2.5 rounded-lg text-sm font-medium font-instrument transition-all duration-200 ${
                  !isCustom && amount === preset
                    ? isIntake
                      ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                      : 'bg-black text-white shadow-md'
                    : 'bg-black/5 text-black/70 hover:bg-black/10'
                }`}
              >
                {preset} ml
              </button>
            ))}
          </div>
        </div>

        {/* Custom amount */}
        <div>
          <span className="text-black/50 text-xs font-medium font-instrument mb-2 block uppercase tracking-wider">
            Custom Amount
          </span>
          <div className="flex gap-2">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setIsCustom(true);
              }}
              placeholder="Enter ml..."
              id="custom-amount-input"
              className="flex-1 px-3 py-2.5 bg-black/5 rounded-lg text-black text-sm font-instrument 
                         placeholder:text-black/30 outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all"
            />
          </div>
        </div>

        {/* Selected amount display */}
        <div className="text-center py-2">
          <span className="text-black/40 text-sm font-instrument">Adding:</span>
          <span className={`ml-2 text-2xl font-semibold font-instrument tabular-nums ${
            isIntake ? 'text-brand-primary' : 'text-black'
          }`}>
            {isCustom ? (customAmount || '0') : amount} ml
          </span>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          id="confirm-add-button"
          className={`w-full py-3.5 rounded-xl text-white text-base font-semibold font-instrument
                     active:scale-[0.98] transition-all duration-200 shadow-lg ${
                       isIntake
                         ? 'bg-brand-primary hover:bg-indigo-800 shadow-brand-primary/20'
                         : 'bg-black hover:bg-black/80 shadow-black/20'
                     }`}
        >
          Confirm {isIntake ? 'Intake' : 'Output'}
        </button>
      </div>
    </div>
  );
}

export default AddFluidModal;
