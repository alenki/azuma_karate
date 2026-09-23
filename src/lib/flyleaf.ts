/**
 * The flyleaf's shared vocabulary: what the inline runtime (components/flyleaf/
 * run.ts), the server component that prints it and the React side all have to
 * agree on. No React in here, so a server component can import it.
 */

/** Dispatched on `window` the moment the sheet starts to open. */
export const FLYLEAF_EVENT = "azuma:flyleaf";

export type FlyleafState = {
  /** The page is visible, or about to be: the leaf has started to part. */
  open: boolean;
  /** Called once the React tree has hydrated; the leaf waits for it. */
  ready?: () => void;
};

declare global {
  interface Window {
    __flyleaf?: FlyleafState;
    /** Set if hydration beats the flyleaf script, so the script can read it. */
    __flyleafReady?: boolean;
  }
}
