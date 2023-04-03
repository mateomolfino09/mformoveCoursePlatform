import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { User } from "../typings";

interface Props {
  user: User;

  isOpen: any;
  setIsOpen: any;
}
const EditUser = ({ user, isOpen, setIsOpen }: Props) => {
  console.log(user);
  function closeModal() {
    setIsOpen(false);
  }

  async function handleSubmit() {
    setIsOpen(false);
  }
  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#141414] p-6 text-left align-middle  transition-all ">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-white-900 mb-4"
                  >
                    Editar Usuario
                  </Dialog.Title>
                  <form className="relative space-y-8 md:mt-0 md:max-w-lg">
                    <div className="flex ">
                      <label className="inline-block mr-2 ">
                        <input
                          type="firstName"
                          id="firstName"
                          name="firstName"
                          placeholder="Nombre"
                          className="input"
                        />
                      </label>
                      <label className="inline-block ">
                        <input
                          name="lastName"
                          id="lastName"
                          type="lastName"
                          placeholder="Apellido"
                          className="input"
                        />
                      </label>
                    </div>
                    <div className="space-y-4">
                      <label className="inline-block w-full ">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          placeholder="Email"
                          className="input"
                        />
                      </label>
                    </div>
                    <div className="space-y-4">
                      <label className="inline-block w-full ">
                        <input
                          type="password"
                          id="password"
                          name="password"
                          placeholder="Contraseña"
                          className="input"
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4  mb-4"
                      onClick={() => handleSubmit()}
                    >
                      Editar
                    </button>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default EditUser;
