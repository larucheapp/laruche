import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

export const CalculatorTool: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [firstValue, setFirstValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

  const reset = () => {
    setDisplay('0');
    setFirstValue(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const calculate = (first: number, second: number, op: string) => {
    switch(op) {
      case '+': return first + second;
      case '-': return first - second;
      case '*': return first * second;
      case '/': return second === 0 ? 0 : first / second;
      case '%': return first % second;
      default: return second;
    }
  };

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit === '.' ? '0.' : digit);
      setWaitingForSecondOperand(false);
    } else {
      if (display === '0' && digit !== '.') {
        setDisplay(digit);
      } else {
        if (digit === '.' && display.includes('.')) return;
        setDisplay(display + digit);
      }
    }
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (firstValue === null) {
      setFirstValue(display);
    } else if (operator) {
      const currentValue = firstValue ? parseFloat(firstValue) : 0;
      const newValue = calculate(currentValue, inputValue, operator);
      const resString = parseFloat(newValue.toPrecision(15)).toString();
      
      setDisplay(resString);
      setFirstValue(resString);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const handleEquals = () => {
      if (!operator || firstValue === null) return;
      
      const inputValue = parseFloat(display);
      const result = calculate(parseFloat(firstValue), inputValue, operator);
      
      // Precision handling
      const resString = parseFloat(result.toPrecision(15)).toString();
      
      setDisplay(resString);
      setFirstValue(null);
      setOperator(null);
      setWaitingForSecondOperand(true);
  };

  const handleDelete = () => {
      if (waitingForSecondOperand) return;
      if (display.length > 1) {
          setDisplay(display.slice(0, -1));
      } else {
          setDisplay('0');
      }
  };

  // Common button styles
  const btnClass = "flex items-center justify-center rounded-md transition-colors text-xs font-bold active:scale-95";
  const numBtnClass = `${btnClass} bg-zinc-900 text-white hover:bg-zinc-800`;
  const opBtnClass = `${btnClass} bg-zinc-800 text-emerald-400 hover:bg-zinc-700`;

  return (
    <div className="w-full h-full flex flex-col p-3 relative overflow-hidden">
      {/* Header - Compact */}
      <div className="flex items-center gap-2 mb-2 text-emerald-400 shrink-0 h-5">
        <Calculator size={16} />
        <h2 className="text-[10px] font-bold uppercase tracking-wider">Calculatrice</h2>
      </div>

      {/* Display - Compact */}
      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 mb-2 text-right flex flex-col justify-center h-10 shrink-0">
        <span className="text-xl font-mono text-white tracking-wider truncate block">
            {display}
        </span>
      </div>

      {/* Keypad - Flexible Grid */}
      <div className="flex-1 grid grid-cols-4 gap-1.5 min-h-0">
        <button onClick={reset} className={opBtnClass}>C</button>
        <button onClick={handleDelete} className={opBtnClass}>DEL</button>
        <button onClick={() => performOperation('%')} className={opBtnClass}>%</button>
        <button onClick={() => performOperation('/')} className={opBtnClass}>÷</button>

        <button onClick={() => inputDigit('7')} className={numBtnClass}>7</button>
        <button onClick={() => inputDigit('8')} className={numBtnClass}>8</button>
        <button onClick={() => inputDigit('9')} className={numBtnClass}>9</button>
        <button onClick={() => performOperation('*')} className={opBtnClass}>×</button>

        <button onClick={() => inputDigit('4')} className={numBtnClass}>4</button>
        <button onClick={() => inputDigit('5')} className={numBtnClass}>5</button>
        <button onClick={() => inputDigit('6')} className={numBtnClass}>6</button>
        <button onClick={() => performOperation('-')} className={opBtnClass}>−</button>

        <button onClick={() => inputDigit('1')} className={numBtnClass}>1</button>
        <button onClick={() => inputDigit('2')} className={numBtnClass}>2</button>
        <button onClick={() => inputDigit('3')} className={numBtnClass}>3</button>
        <button onClick={() => performOperation('+')} className={opBtnClass}>+</button>

        <button onClick={() => inputDigit('0')} className={numBtnClass}>0</button>
        <button onClick={() => inputDigit('.')} className={numBtnClass}>.</button>
        <button onClick={handleEquals} className={`${btnClass} col-span-2 bg-emerald-600 text-white hover:bg-emerald-500`}>=</button>
      </div>
    </div>
  );
};