import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from './Button';

/**
 * formatNumber
 * Formats the displayed number string without losing trailing dot intent.
 */
function formatNumber(value) {
  if (value === '' || value === null || value === undefined) return '0';
  if (typeof value !== 'string') value = String(value);
  // If ends with dot, preserve it for user typing like "3."
  if (value.endsWith('.')) return value;
  const asNum = Number(value);
  if (Number.isNaN(asNum)) return value;
  return asNum.toString();
}

/**
 * compute
 * Pure function to compute a result given previous, operator, and current.
 * Handles division by zero safely. Returns { result, error }.
 */
function compute(prev, op, curr) {
  const a = Number(prev);
  const b = Number(curr);
  if (Number.isNaN(a) || Number.isNaN(b)) return { result: curr, error: null };
  let result = 0;
  switch (op) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '×': result = a * b; break;
    case '÷':
      if (b === 0) return { result: 'Cannot divide by 0', error: 'DIV0' };
      result = a / b;
      break;
    default: return { result: curr, error: null };
  }
  // Limit to avoid floating point noise
  const fixed = Number.isFinite(result) ? Number(result.toFixed(12)) : result;
  return { result: String(fixed), error: null };
}

/**
 * PUBLIC_INTERFACE
 * Calculator
 * A modern, minimalist calculator with Ocean Professional theme.
 * - Supports +, -, ×, ÷, decimals, clear, delete, equals.
 * - Left-to-right evaluation for chained operations (documented).
 * - Safe division handling (error state when dividing by zero).
 * - Keyboard support: digits, operators (+ - * /), Enter (=), Backspace (DEL), Escape (C), period (.).
 */
export default function Calculator() {
  const [current, setCurrent] = useState('0');
  const [previous, setPrevious] = useState(null);
  const [operator, setOperator] = useState(null);
  const [overwrite, setOverwrite] = useState(false);
  const [error, setError] = useState(null);

  // Handlers
  const clearAll = useCallback(() => {
    setCurrent('0');
    setPrevious(null);
    setOperator(null);
    setOverwrite(false);
    setError(null);
  }, []);

  const deleteLast = useCallback(() => {
    if (error) return; // ignore while in error state
    if (overwrite) {
      setCurrent('0');
      setOverwrite(false);
      return;
    }
    setCurrent((cur) => {
      if (cur.length <= 1) return '0';
      return cur.slice(0, -1);
    });
  }, [error, overwrite]);

  const inputDigit = useCallback((digit) => {
    if (error) return; // ignore while in error state
    setCurrent((cur) => {
      if (overwrite) {
        setOverwrite(false);
        return digit === '0' ? '0' : digit;
      }
      // Prevent multiple leading zeros
      if (cur === '0') return digit;
      return cur + digit;
    });
  }, [error, overwrite]);

  const inputDot = useCallback(() => {
    if (error) return; // ignore while in error state
    setCurrent((cur) => {
      if (overwrite) {
        setOverwrite(false);
        return '0.';
      }
      if (cur.includes('.')) return cur;
      return cur + '.';
    });
  }, [error, overwrite]);

  const chooseOperator = useCallback((op) => {
    if (error) return; // ignore while in error state
    // If previous exists and operator exists, compute left-to-right
    if (previous !== null && operator !== null && !overwrite) {
      const { result, error: err } = compute(previous, operator, current);
      if (err) {
        setError(err);
        setCurrent(result);
        setPrevious(null);
        setOperator(null);
        setOverwrite(true);
        return;
      }
      setPrevious(result);
      setCurrent('0');
      setOperator(op);
      setOverwrite(true);
      return;
    }

    // Set the operator and move current to previous
    setPrevious(current);
    setCurrent('0');
    setOperator(op);
    setOverwrite(true);
  }, [current, error, operator, previous, overwrite]);

  const evaluate = useCallback(() => {
    if (error) return;
    if (previous === null || operator === null) return;
    const { result, error: err } = compute(previous, operator, current);
    if (err) {
      setError(err);
      setCurrent(result);
      setPrevious(null);
      setOperator(null);
      setOverwrite(true);
      return;
    }
    setCurrent(result);
    setPrevious(null);
    setOperator(null);
    setOverwrite(true);
  }, [current, error, operator, previous]);

  // Keyboard support
  useEffect(() => {
    const onKeyDown = (e) => {
      const key = e.key;

      if (key === 'Escape') { e.preventDefault(); clearAll(); return; }
      if (key === 'Backspace') { e.preventDefault(); deleteLast(); return; }
      if (key === 'Enter' || key === '=') { e.preventDefault(); evaluate(); return; }

      if (key >= '0' && key <= '9') { e.preventDefault(); inputDigit(key); return; }
      if (key === '.') { e.preventDefault(); inputDot(); return; }

      if (key === '+' || key === '-') { e.preventDefault(); chooseOperator(key); return; }
      if (key === '*' || key.toLowerCase() === 'x') { e.preventDefault(); chooseOperator('×'); return; }
      if (key === '/') { e.preventDefault(); chooseOperator('÷'); return; }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [chooseOperator, clearAll, deleteLast, evaluate, inputDigit, inputDot]);

  const expression = useMemo(() => {
    if (error) return 'Error';
    if (previous !== null && operator) {
      return `${formatNumber(previous)} ${operator}`;
    }
    return '';
  }, [error, operator, previous]);

  return (
    <section className="calc-panel" aria-label="Calculator">
      <div className="calc-header">
        <h2 className="calc-title">Ocean Calculator</h2>
      </div>

      <div className={`display ${error ? 'error' : ''}`} role="status" aria-live="polite">
        <div className="expression">{expression}</div>
        <div className="value">{formatNumber(current)}</div>
      </div>

      <div className="keypad" role="group" aria-label="Calculator keypad">
        {/* Row 1 */}
        <Button variant="action" ariaLabel="Clear" onClick={clearAll}>C</Button>
        <Button variant="action" ariaLabel="Delete" onClick={deleteLast}>DEL</Button>
        <Button variant="operator" ariaLabel="Divide" onClick={() => chooseOperator('÷')}>÷</Button>
        <Button variant="operator" ariaLabel="Multiply" onClick={() => chooseOperator('×')}>×</Button>

        {/* Row 2 */}
        <Button onClick={() => inputDigit('7')}>7</Button>
        <Button onClick={() => inputDigit('8')}>8</Button>
        <Button onClick={() => inputDigit('9')}>9</Button>
        <Button variant="operator" ariaLabel="Subtract" onClick={() => chooseOperator('-')}>-</Button>

        {/* Row 3 */}
        <Button onClick={() => inputDigit('4')}>4</Button>
        <Button onClick={() => inputDigit('5')}>5</Button>
        <Button onClick={() => inputDigit('6')}>6</Button>
        <Button variant="operator" ariaLabel="Add" onClick={() => chooseOperator('+')}>+</Button>

        {/* Row 4 */}
        <Button onClick={() => inputDigit('1')}>1</Button>
        <Button onClick={() => inputDigit('2')}>2</Button>
        <Button onClick={() => inputDigit('3')}>3</Button>
        <Button variant="equal" ariaLabel="Equals" onClick={evaluate}>=</Button>

        {/* Row 5 */}
        <Button wide onClick={() => inputDigit('0')}>0</Button>
        <Button onClick={inputDot}>.</Button>
        <Button variant="equal" ariaLabel="Equals" onClick={evaluate}>=</Button>
      </div>

      <div className="calc-footer">
        <span>Left-to-right evaluation</span>
        <span>
          <span className="kbd">Esc</span> Clear • <span className="kbd">⌫</span> Del • <span className="kbd">Enter</span> =
        </span>
      </div>
    </section>
  );
}
