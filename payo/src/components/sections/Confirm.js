import { createContext, useCallback, useContext, useRef, useState } from "react";

import Modal from "./Modal";

const ConfirmContext = createContext(async () => false);

/**
 * const confirm = useConfirm();
 * if (await confirm({ title, message, confirmLabel, danger: true })) { ... }
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setState(options);
      }),
    []
  );

  const close = (result) => {
    resolver.current?.(result);
    resolver.current = null;
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={Boolean(state)}
        onClose={() => close(false)}
        title={state?.title || "Are you sure?"}
        width={420}
        footer={
          <>
            <button type="button" className="pbtn pbtn-ghost" onClick={() => close(false)}>
              Cancel
            </button>
            <button
              type="button"
              className={`pbtn ${state?.danger ? "pbtn-danger-solid" : "pbtn-primary"}`}
              onClick={() => close(true)}
              autoFocus
            >
              {state?.confirmLabel || "Confirm"}
            </button>
          </>
        }
      >
        <p className="pf-confirm-text">{state?.message}</p>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
