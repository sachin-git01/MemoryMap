import { getIcon } from '../utils/icons';

export const LogoutConfirmModal = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[1.5rem] border border-sky-100 bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          {getIcon('logout', { size: 22 })}
        </div>
        <h3 className="mt-4 text-lg font-extrabold text-slate-950">Are you sure?</h3>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
          You will be logged out and returned to the MemoryMap home page.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
