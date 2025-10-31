import { Dialog } from '../ui';
import { useDialog } from '../../hooks/useDialog';

interface DialogProviderProps {
  children: (dialog: ReturnType<typeof useDialog>) => React.ReactNode;
}

export const DialogProvider = ({ children }: DialogProviderProps) => {
  const dialog = useDialog();

  return (
    <>
      <Dialog
        isOpen={dialog.dialogState.isOpen}
        onClose={dialog.hideDialog}
        title={dialog.dialogState.title}
        type={dialog.dialogState.type}
        showCancel={dialog.dialogState.showCancel}
        onConfirm={dialog.dialogState.onConfirm}
      >
        {dialog.dialogState.message}
      </Dialog>
      {children(dialog)}
    </>
  );
};
