import { IndividualClass, User } from '../../typings';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';

interface Props {
    clase: IndividualClass | null;
    deleteClass: any;
  isOpen: any;
  setIsOpen: any;
}
const DeleteClass = ({ clase, deleteClass, isOpen, setIsOpen }: Props) => {
  function closeModal() {
    setIsOpen(false);
  }

  async function handleSubmit() {
    deleteClass();
    setIsOpen(false);
  }
  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as='div' className='relative z-10' onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black bg-opacity-50' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-[#141414] p-6 text-left align-middle  transition-all '>
                  <Dialog.Title
                    as='h3'
                    className='text-lg font-medium leading-6 text-white-900'
                  >
                    Eliminar Clase
                  </Dialog.Title>
                  <div className='mt-2'>
                    <p>Estas a punto de eliminar una clase.</p>
                  </div>

                  <div className='mt-4'>
                    <button
                      type='button'
                      className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-4 mt-4 mb-4'
                      onClick={() => handleSubmit()}
                    >
                      Eliminar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default DeleteClass;
