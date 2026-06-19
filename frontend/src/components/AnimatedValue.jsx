import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion.js";

const NUMBER_RE = /-?\d[\d,]*\.?\d*/;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

/** Split "+6.5 min" -> { prefix:"+", target:6.5, suffix:" min", decimals:1, grouped:false } */
function parseValue(text) {
  const match = text.match(NUMBER_RE);
  if (!match) return { isNumeric: false };
  const raw = match[0];
  const target = parseFloat(raw.replace(/,/g, ""));
  if (Number.isNaN(target)) return { isNumeric: false };
  return {
    isNumeric: true,
    prefix: text.slice(0, match.index),
    suffix: text.slice(match.index + raw.length),
    target,
    decimals: raw.includes(".") ? raw.split(".")[1].length : 0,
    grouped: raw.includes(","),
  };
}

function format(value, decimals, grouped) {
  return grouped
    ? value.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : value.toFixed(decimals);
}

/**
 * A metric value that counts up on mount and eases between values on live
 * updates (so WebSocket pushes never jump). Non-numeric values cross-fade.
 * Honors prefers-reduced-motion by rendering the final value instantly.
 */
export default function AnimatedValue({ value, duration = 720 }) {
  const text = value == null ? "" : String(value);
  const parsed = useMemo(() => parseValue(text), [text]);
  const reduced = useReducedMotion();

  const [display, setDisplay] = useState(parsed.isNumeric ? parsed.target : text);
  const fromRef = useRef(parsed.isNumeric ? parsed.target : 0);
  const rafRef = useRef(0);

  const target = parsed.isNumeric ? parsed.target : null;

  useEffect(() => {
    if (!parsed.isNumeric) return undefined;
    if (reduced) {
      setDisplay(target);
      fromRef.current = target;
      return undefined;
    }
    const from = fromRef.current;
    if (from === target) {
      setDisplay(target);
      return undefined;
    }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const current = from + (target - from) * easeOut(t);
      setDisplay(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, reduced, parsed.isNumeric]);

  if (!parsed.isNumeric) {
    // Cross-fade on change via remount.
    return (
      <span className="value-anim" key={text}>
        {text}
      </span>
    );
  }

  return (
    <span className="value-anim">
      {parsed.prefix}
      {format(display, parsed.decimals, parsed.grouped)}
      {parsed.suffix}
    </span>
  );
}
