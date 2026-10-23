import { useRef } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';

/** Destructive or important confirmation built on the base modal. */
export function ConfirmDialog({
  open,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
  variant = 'danger',
  isLoading = false,
  children,
}) {
  const cancelRef = useRef(null);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      initialFocusRef={cancelRef}
      footer={
        <>
          <Button ref={cancelRef} variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children ? <div className="pb-3 text-sm leading-6 text-ink-muted">{children}</div> : null}
    </Modal>
  );
}
