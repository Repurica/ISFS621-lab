interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  return (
    <div className="toast" role="status" aria-live="polite" data-visible={message ? 'true' : 'false'}>
      {message}
    </div>
  );
}
