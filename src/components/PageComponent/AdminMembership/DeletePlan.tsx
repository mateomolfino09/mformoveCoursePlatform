import { Plan } from '../../../../typings';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { AdminButton } from '../../admin';

interface Props {
  plan: Plan | null;
  deletePlan: any;
  isOpen: any;
  setIsOpen: any;
}

const DeletePlan = ({ plan, deletePlan, isOpen, setIsOpen }: Props) => {
  function closeModal() {
    setIsOpen(false);
  }

  async function handleSubmit() {
    deletePlan();
    setIsOpen(false);
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-150"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Panel className="w-full max-w-md rounded-[var(--admin-radius-lg)] border border-[var(--admin-border)] bg-white p-5 text-left shadow-[var(--admin-shadow-float)]">
                <Dialog.Title as="h3" className="text-[15px] font-medium text-gray-900">
                  Eliminar plan
                </Dialog.Title>
                <p className="mt-2 text-[13px] text-[var(--admin-muted)]">
                  Vas a eliminar {plan?.name ? `“${plan.name}”` : 'este plan'}. Esta acción no se puede deshacer.
                </p>
                <div className="mt-5 flex justify-end gap-2">
                  <AdminButton type="button" variant="ghost" onClick={closeModal}>
                    Cancelar
                  </AdminButton>
                  <AdminButton type="button" variant="destructive" onClick={handleSubmit}>
                    Eliminar
                  </AdminButton>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DeletePlan;
