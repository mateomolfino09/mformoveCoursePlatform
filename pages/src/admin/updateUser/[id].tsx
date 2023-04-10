import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { parseCookies } from "nookies";
import { Accept, useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { ArrowUpTrayIcon, DocumentIcon } from "@heroicons/react/24/outline";
import Select, { StylesConfig } from "react-select";
import { genders } from "../../../../constants/genders";
import { countries } from "../../../../constants/countries";
import { loadUser } from "../../../api/user/loadUser";
import requests from "../../../../utils/requests";
import AdmimDashboardLayout from "../../../../components/AdmimDashboardLayout";
import { getUserFromBack } from "../../../api/user/getUserFromBack";
import { UserContext } from "../../../../hooks/userContext";
import { User } from "../../../../typings";

const colourStyles: StylesConfig<any> = {
  control: (styles) => ({
    ...styles,
    backgroundColor: "#333",
    height: 55,
    borderRadius: 6,
    padding: 0,
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    return { ...styles, color: "#808080" };
  },
  input: (styles) => ({ ...styles, backgroundColor: "", color: "#fff" }),
  placeholder: (styles) => ({ ...styles, color: "#fff" }),
  singleValue: (styles, { data }) => ({ ...styles, color: "#808080" }),
};

// interface User {
//   id: number;
//   name: string;
//   rol: string;
//   email: string;
//   password: string;
// }

// interface ProfileUser {
//   user: User | null;
//   loading: boolean;
//   error: any;
// }

// interface Props {
//   user: User;
//   session: User;
// }

interface Props {
  user: User;
}

const EditUser = ({ user }: Props) => {
  const cookies = parseCookies();
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [userCtx, setUserCtx] = useState<User>(user);
  const [userDB, setUserDB] = useState<User>();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const providerValue = useMemo(
    () => ({ userCtx, setUserCtx }),
    [userCtx, setUserCtx]
  );

  useEffect(() => {
    if (user === null || user.rol != "Admin") {
      router.push("/src/user/login");
    }
  }, [session, router]);

  useEffect(() => {
    const getUserDB = async () => {
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };
        const userId = id;
        const { data } = await axios.get(`/api/user/${userId}`, config);
        const completeName = data.name.split(" ");
        const name = completeName[0];
        const last = completeName.slice(1).join(" ");
        setFirstname(name);
        setLastname(last);
        setUserDB(data);
        setEmail(data.email);
        setGender(data.gender);
        setCountry(data.country);
      } catch (error: any) {
        console.log(error.message);
      }
    };

    getUserDB();
  }, [router, session]);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    try {
      if (userDB) {
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };
        const response = await axios.patch(
          `/api/user/update/${userDB._id}`,
          {
            firstname,
            lastname,
            email,
            gender,
            country,
          },
          config
        );
        if (response) {
          router.push("/src/admin/users");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  console.log(userDB);
  console.log(userDB?.courses[0].purchased);
  return (
    userDB && (
      <UserContext.Provider value={providerValue}>
        <AdmimDashboardLayout>
          <div className="relative flex w-full flex-col bg-black md:items-center md:justify-center md:bg-transparent">
            <Head>
              <title>Video Streaming</title>
              <meta name="description" content="Stream Video App" />
              <link rel="icon" href="/favicon.ico" />
            </Head>

            <div
              className={`h-full w-full relative flex flex-col md:items-center md:justify-center`}
            >
              {/* Logo position */}
              <form
                onSubmit={handleSubmit}
                className="relative mt-24 space-y-4 rounded border-2 border-black/75 bg-black/50 py-12  px-8 md:mt-12 md:max-w-lg md:px-14"
              >
                <h1 className="text-4xl font-semibold">Editar Usuario</h1>
                <div className="relative space-y-8 md:mt-0 md:max-w-lg">
                  {" "}
                  <div className="flex ">
                    {" "}
                    <label className="inline-block mr-2 ">
                      {" "}
                      <input
                        type="firstName"
                        id="firstName"
                        name="firstName"
                        value={firstname}
                        placeholder="Nombre"
                        className="input"
                        onChange={(e) => setFirstname(e.target.value)}
                      />
                    </label>
                    <label className="inline-block">
                      <input
                        name="lastName"
                        id="lastName"
                        type="lastName"
                        value={lastname}
                        placeholder="Apellido"
                        className="input"
                        onChange={(e) => setLastname(e.target.value)}
                      />
                    </label>
                  </div>
                  <div>
                    <label className="inline-block w-full ">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Email"
                        value={email}
                        className="input"
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="flex   ">
                    <Select
                      options={genders}
                      styles={colourStyles}
                      placeholder={"Género"}
                      className="w-52 mr-2"
                      defaultInputValue={gender}
                      onChange={(e) => {
                        return setGender(e.label);
                      }}
                      // onChange={(e) => {
                      //   return setGender(e.label);
                      // }}
                      // onKeyDown={keyDownHandler}
                    />
                    <Select
                      options={countries}
                      styles={colourStyles}
                      className=" w-52"
                      placeholder={"País"}
                      defaultInputValue={country}
                      value={country}
                      onChange={(e) => {
                        return setCountry(e.label);
                      }}
                      // value={country}
                      //  onChange={e => {
                      //  return setCountry(e.label)}}
                      //  onKeyDown={keyDownHandler}
                    />
                  </div>
                  <button className="w-full bg-black/10 border border-white rounded-md transition duration-500 hover:bg-black py-3 font-semibold">
                    Editar Usuario{" "}
                  </button>
                </div>

                <div className="text-[gray]">
                  Volver al Inicio
                  <Link href={"/src/admin/users"}>
                    <button
                      type="button"
                      className="text-white hover:underline ml-2"
                    >
                      {" "}
                      Volver
                    </button>
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </AdmimDashboardLayout>
      </UserContext.Provider>
    )
  );
};

export async function getServerSideProps(context: any) {
  const session = await getSession(context);
  const { params, query, req, res } = context;
  const cookies = parseCookies(context);
  const userCookie = cookies?.user ? JSON.parse(cookies.user) : session?.user;
  const email = userCookie.email;
  const user = await getUserFromBack(email);

  return {
    props: { user },
  };
}

export default EditUser;

//===============================================================

// import { Dialog, Transition } from "@headlessui/react";
// import { Fragment, useState, useEffect } from "react";
// import Select, { StylesConfig } from "react-select";
// import { genders } from "../../../constants/genders";
// import { countries } from "../../../constants/countries";
// import { User } from "../../../typings";

// const colourStyles: StylesConfig<any> = {
//   control: (styles) => ({
//     ...styles,
//     backgroundColor: "#333",
//     height: 55,
//     borderRadius: 6,
//     padding: 0,
//   }),
//   option: (styles, { data, isDisabled, isFocused, isSelected }) => {
//     return { ...styles, color: "#808080" };
//   },
//   input: (styles) => ({ ...styles, backgroundColor: "", color: "#fff" }),
//   placeholder: (styles) => ({ ...styles, color: "#fff" }),
//   singleValue: (styles, { data }) => ({ ...styles, color: "#808080" }),
// };
// interface Props {
//   user: User;
//   isOpen: any;
//   setIsOpen: any;
// }

// const EditUser = ({ user, isOpen, setIsOpen }: Props) => {
//   console.log(genders);
//   const firstName: any[] = [];
//   const lastName: any[] = [];
//   function closeModal() {
//     setIsOpen(false);
//   }

//   async function handleSubmit() {
//     setIsOpen(false);
//   }
//   function splitFullName(fullName: any) {
//     const completeName = fullName.split(" ");
//     const name = completeName[0];
//     const last = completeName.slice(1).join(" ");
//     firstName.push(name);
//     lastName.push(last);
//   }
//   useEffect(() => {
//     splitFullName(user.name);
//   });

//   return (
//     <>
//       <Transition appear show={isOpen} as={Fragment}>
//         <Dialog as="div" className="relative z-10" onClose={closeModal}>
//           <Transition.Child
//             as={Fragment}
//             enter="ease-out duration-300"
//             enterFrom="opacity-0"
//             enterTo="opacity-100"
//             leave="ease-in duration-200"
//             leaveFrom="opacity-100"
//             leaveTo="opacity-0"
//           >
//             <div className="fixed inset-0 bg-black bg-opacity-50" />
//           </Transition.Child>

//           <div className="fixed inset-0 overflow-y-auto">
//             <div className="flex min-h-full items-center justify-center p-4 text-center">
//               <Transition.Child
//                 as={Fragment}
//                 enter="ease-out duration-300"
//                 enterFrom="opacity-0 scale-95"
//                 enterTo="opacity-100 scale-100"
//                 leave="ease-in duration-200"
//                 leaveFrom="opacity-100 scale-100"
//                 leaveTo="opacity-0 scale-95"
//               >
//                 <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#141414] p-6 text-left align-middle  transition-all ">
//                   <Dialog.Title
//                     as="h3"
//                     className="text-lg font-medium leading-6 text-white-900 mb-4"
//                   >
//                     Editar Usuario
//                   </Dialog.Title>
//                   <form className="relative space-y-8 md:mt-0 md:max-w-lg">
//                     <div className="flex ">
//                       <label className="inline-block mr-2 ">
//                         <input
//                           type="firstName"
//                           id="firstName"
//                           name="firstName"
//                           defaultValue={firstName}
//                           placeholder="Nombre"
//                           className="input"
//                         />
//                       </label>
//                       <label className="inline-block ">
//                         <input
//                           name="lastName"
//                           id="lastName"
//                           type="lastName"
//                           defaultValue={lastName}
//                           placeholder="Apellido"
//                           className="input"
//                         />
//                       </label>
//                     </div>
//                     <div className="space-y-4">
//                       <label className="inline-block w-full ">
//                         <input
//                           type="email"
//                           id="email"
//                           name="email"
//                           placeholder="Email"
//                           className="input"
//                         />
//                       </label>
//                     </div>
//                     <div className="flex   ">
//                       <Select
//                         options={genders}
//                         styles={colourStyles}
//                         placeholder={"Género"}
//                         className="w-52 mr-2"
//                         // value={gender}
//                         // onChange={(e) => {
//                         //   return setGender(e.label);
//                         // }}
//                         // onKeyDown={keyDownHandler}
//                       />
//                       <Select
//                         options={countries}
//                         styles={colourStyles}
//                         className=" w-52"
//                         placeholder={"País"}
//                         // value={country}
//                         //  onChange={e => {
//                         //  return setCountry(e.label)}}
//                         //  onKeyDown={keyDownHandler}
//                       />
//                     </div>

//                     <button
//                       type="button"
//                       className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4  mb-4"
//                       onClick={() => handleSubmit()}
//                     >
//                       Editar
//                     </button>
//                   </form>
//                 </Dialog.Panel>
//               </Transition.Child>
//             </div>
//           </div>
//         </Dialog>
//       </Transition>
//     </>
//   );
// };

// export default EditUser;
