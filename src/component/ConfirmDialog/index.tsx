import * as AlertDialog from '@radix-ui/react-alert-dialog';

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
  cancelLabel?: string;
  confirmLabel?: string;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title = 'Tem certeza?',
  description = 'Esta ação não pode ser desfeita.',
  onConfirm,
  cancelLabel = 'Cancelar',
  confirmLabel = 'Confirmar',
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
        <AlertDialog.Content className="fixed top-[50%] left-[50%] max-w-sm w-full bg-white p-6 rounded-md shadow-lg transform -translate-x-1/2 -translate-y-1/2">
          <AlertDialog.Title className="text-lg font-semibold">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 mb-4 text-sm text-gray-600">
            {description}
          </AlertDialog.Description>
          <div className="flex justify-end gap-2">
            <AlertDialog.Cancel className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              {cancelLabel}
            </AlertDialog.Cancel>
            <AlertDialog.Action
              className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-500"
              onClick={onConfirm}
            >
              {confirmLabel}
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
