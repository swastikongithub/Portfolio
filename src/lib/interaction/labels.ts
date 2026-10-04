/**
 * Impact labels: a tiny event bus from the instrument to the DOM label layer.
 * The instrument says what happened ("23P01", "404", "stored") and where on
 * screen; ImpactLabels renders it there and announces it to screen readers.
 */
export interface ImpactLabel {
  text: string;
  /** Client coordinates. */
  x: number;
  y: number;
  /** Signal-coloured when the outcome is the accepted path. */
  accepted: boolean;
}

type Listener = (l: ImpactLabel) => void;
const listeners = new Set<Listener>();

export function emitLabel(label: ImpactLabel) {
  listeners.forEach((fn) => fn(label));
}

export function onLabel(fn: Listener) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}
