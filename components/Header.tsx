import { MagnifyingGlassIcon, BellIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { parseCookies } from "nookies";
import cookie from "js-cookie";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  LOAD_USER_REQUEST,
  LOAD_USER_FAIL,
  LOAD_USER_SUCCESS,
} from "../slices/userSlice";
import { RootState } from "../redux/store";
import { Interface } from "readline";
import axios from "axios";
import { toast } from "react-toastify";

const Header = () => {
  interface User {
    id: number;
    name: string;
    email: string;
    password: string;
  }

  interface ProfileUser {
    user: User | null;
    loading: boolean;
    error: any;
  }

  interface Props {
    email: String;
    user: User;
  }
  const dispatch = useDispatch();
  const LoadUser = async (email: String, user: User) => {
    try {
      dispatch(LOAD_USER_REQUEST());

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(`/api/user/profile`, { email }, config);


      dispatch(LOAD_USER_SUCCESS(data || user));
    } catch (error: any) {
      dispatch(
        LOAD_USER_FAIL(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        )
      );
    }
  };
  const { loading, error, dbUser } = useSelector(
    (state: RootState) => state.profileUser
  );

  const cookies = parseCookies();
  const { data: session } = useSession();
  const router = useRouter();
  const [userState, setUserState] = useState<any>(null);

  const [isScrolled, setIsScrolled] = useState(false);

  const user: User = dbUser
    ? dbUser
    : cookies?.user
    ? JSON.parse(cookies.user)
    : session?.user
    ? session?.user
    : "";

  useEffect(() => {
    session ? setUserState(session.user) : setUserState(user);

    if (user) {
      LoadUser(user.email, user);
    }

    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [router, useState]);

  // useEffect(() => {
  //     session ? setUserState(session.user) : setUserState(user)

  //     // if(user) {
  //     // }

  // }, [router, userState])

  const logoutHandler = async () => {
    if (session) signOut();
    cookie.remove("token");
    cookie.remove("user");

    router.push("/src/user/login");
  };

  return (
    <header className={`${isScrolled && "bg-[#141414]"}`}>
      <div className="flex items-center space-x-2 md:space-x-10">
        <img
          src="https://rb.gy/ulxxee"
          width={100}
          height={100}
          className="cursor-pointer object-contain"
        />

        <ul className="hidden space-x-4 md:flex">
          <li className="headerLink">Home</li>
          <li className="headerLink">Cursos</li>
          <li className="headerLink">Nuevo</li>
          <li className="headerLink">Mi Lista</li>
        </ul>
      </div>
      <div className="flex items-center space-x-4 text-sm font-light">
        <MagnifyingGlassIcon className="hidden h-6 w-6 sm:inline " />
        <p className="hidden lg:inline">Mis cursos</p>
        <BellIcon className="h-6 w-6" />
        {/* <Link href="/account"> */}
        <img
          src="https://rb.gy/g1pwyx"
          alt=""
          className="cursor-pointer rounded"
          onClick={() => logoutHandler()}
        />
        {/* </Link> */}
      </div>
    </header>
  );
};

export default Header;
