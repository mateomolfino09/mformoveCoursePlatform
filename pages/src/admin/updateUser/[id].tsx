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
import { purchased } from "../../../../constants/purchased";
import { loadUser } from "../../../api/user/loadUser";
import requests from "../../../../utils/requests";
import AdmimDashboardLayout from "../../../../components/AdmimDashboardLayout";
import { getUserFromBack } from "../../../api/user/getUserFromBack";
import { UserContext } from "../../../../hooks/userContext";
import { User } from "../../../../typings";
import { ChangeEvent } from "react";

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
interface Course {
  _id: string;
  name: string;
  inList: boolean;
  like: boolean;
  purchased: boolean;
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
  const [rol, setRol] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);

  const providerValue = useMemo(
    () => ({ userCtx, setUserCtx }),
    [userCtx, setUserCtx]
  );

  useEffect(() => {
    if (user === null || user.rol != "Admin") {
      router.push("/src/user/login");
    }
  }, [session, router]);
  const test = [
    {
      name: "test1",
      inList: false,
      like: true,
      purchased: true,
    },
    {
      name: "test2",
      inList: false,
      like: true,
      purchased: false,
    },
  ];
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
        setRol(data.rol);

        setCourses(data.courses);
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
            rol,
            courses,
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
  console.log(userDB?.courses);

  // const namesList = purchased.map((item) => (
  //   <>
  //     <label className="inline-block w-full ">ID del curso: {item._id}</label>
  //     <input
  //       type="text"
  //       id="purchased"
  //       name="purchased"
  //       placeholder="Purchased"
  //       value={item.purchased.toString()}
  //       className="input"
  //       onChange={(e) => setPurchased(e.target.value)}
  //     />
  //   </>
  // ));
  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>,
    index: number
  ) {
    const { name, value } = event.target;
    setCourses((prevCourses) => {
      const updatedCourses = [...prevCourses];
      updatedCourses[index] = { ...updatedCourses[index], [name]: value };
      return updatedCourses;
    });
  }
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
                  <div>
                    <Select
                      options={purchased}
                      styles={colourStyles}
                      placeholder={"Género"}
                      className="w-52 mr-2"
                      defaultInputValue={rol}
                      onChange={(e) => {
                        return setRol(e.label);
                      }}
                    />
                  </div>
                  <div>
                    {courses.map((course, index) => (
                      <div key={index}>
                        <label className="inline-block w-full ">
                          ID del curso: {course._id}
                        </label>
                        <input
                          type="text"
                          id="purchased"
                          name="purchased"
                          placeholder="Purchased"
                          value={course.purchased.toString()}
                          className="input"
                          onChange={(event) => handleInputChange(event, index)}
                        />
                      </div>
                    ))}
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
                    />
                  </div>
                  <div>
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
