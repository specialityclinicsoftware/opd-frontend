import { useState, useCallback } from 'react';

interface DialogState {
  isOpen: boolean;
  message: string;
  title?: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  onConfirm?: () => void;
  showCancel?: boolean;
}

export const useDialog = () => {
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const showDialog = useCallback(
    (
      message: string,
      options?: {
        title?: string;
        type?: 'info' | 'success' | 'error' | 'warning';
        onConfirm?: () => void;
        showCancel?: boolean;
      }
    ) => {
      setDialogState({
        isOpen: true,
        message,
        title: options?.title,
        type: options?.type || 'info',
        onConfirm: options?.onConfirm,
        showCancel: options?.showCancel || false,
      });
    },
    []
  );

  const hideDialog = useCallback(() => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showSuccess = useCallback(
    (message: string, title?: string) => {
      showDialog(message, { type: 'success', title: title || 'Success' });
    },
    [showDialog]
  );

  const showError = useCallback(
    (message: string, title?: string) => {
      showDialog(message, { type: 'error', title: title || 'Error' });
    },
    [showDialog]
  );

  const showWarning = useCallback(
    (message: string, title?: string) => {
      showDialog(message, { type: 'warning', title: title || 'Warning' });
    },
    [showDialog]
  );

  const showInfo = useCallback(
    (message: string, title?: string) => {
      showDialog(message, { type: 'info', title: title || 'Information' });
    },
    [showDialog]
  );

  const confirm = useCallback(
    (message: string, onConfirm: () => void, title?: string) => {
      showDialog(message, {
        type: 'warning',
        title: title || 'Confirm',
        onConfirm,
        showCancel: true,
      });
    },
    [showDialog]
  );

  return {
    dialogState,
    showDialog,
    hideDialog,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    confirm,
  };
};
