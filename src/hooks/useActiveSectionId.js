import { createContext, useContext } from 'react';

/**
 * Context + consumer hook split into their own (non-component) file
 * so ActiveSectionProvider.jsx can export only a component — keeps
 * Fast Refresh working cleanly there.
 */
export const ActiveSectionContext = createContext(null);

/** The id of the homepage section currently in view, or null. */
export function useActiveSectionId() {
  return useContext(ActiveSectionContext);
}
