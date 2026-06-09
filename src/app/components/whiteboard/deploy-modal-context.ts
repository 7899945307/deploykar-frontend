import { createContext } from 'react';

export const DeployModalContext = createContext<{ openDeployModal: (nodeId: string) => void }>({
  openDeployModal: () => {},
});

// Store-based callback for triggering the deploy modal from anywhere
let _openDeployModalFn: ((nodeId: string) => void) | null = null;

export function registerOpenDeployModal(fn: (nodeId: string) => void) {
  console.log('[DeployModal] registerOpenDeployModal called');
  _openDeployModalFn = fn;
}

export function triggerOpenDeployModal(nodeId: string) {
  console.log('[DeployModal] triggerOpenDeployModal called, nodeId:', nodeId, 'fn registered:', !!_openDeployModalFn);
  if (_openDeployModalFn) {
    _openDeployModalFn(nodeId);
  } else {
    console.error('[DeployModal] NO FUNCTION REGISTERED! Modal cannot open.');
  }
}
