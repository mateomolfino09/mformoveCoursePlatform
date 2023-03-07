import { MagnifyingGlassIcon, BellIcon, Cog8ToothIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { RefObject, useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { parseCookies } from "nookies";
import cookie from "js-cookie";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { loadUser } from "../redux/user/userAction";
import { State } from "../redux/reducers";
import { useAppDispatch } from "../hooks/useTypeSelector";
import { User } from "../typings";


const Header = ({ scrollToList, scrollToModa, scrollToNuevo, scrollToMy }: any) => {

  interface ProfileUser {
    user: User | null;
    loading: boolean;
    error: any;
  }

  interface Props {
    email: String;
    user: User;
  }

  const dispatch = useAppDispatch()
  const profile = useSelector((state: State) => state.profile)
  const { loading, error, dbUser } = profile


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
      dispatch(loadUser(user.email, user))
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
  }, [router]);

  const logoutHandler = async () => {
    if (session) signOut();
    cookie.remove("token");
    cookie.remove("user");

    router.push("/user/login");
  };

  return (
    <header className={`${isScrolled && "bg-[#141414]"}`}>
      <div className="flex items-center space-x-2 md:space-x-10">
        <img
          alt='icon image'
          src="https://rb.gy/ulxxee"
          width={100}
          height={100}
          className="cursor-pointer object-contain"
        />

        <ul className="hidden space-x-4 md:flex">
        <Link href={'/src/home'}><li className="headerLink">Home</li></Link>
        {scrollToModa != null ? <li onClick={scrollToModa} className="headerLink">Cursos</li> : <Link href={'/src/home'}><li className="headerLink">Cursos</li></Link>}
        {scrollToNuevo != null ? <li onClick={scrollToNuevo} className="headerLink">Nuevo</li> : <Link href={'/src/home'}><li className="headerLink">Nuevo</li></Link>}
        {scrollToList != null ? <li onClick={scrollToList} className="headerLink">Mi Lista</li> : <Link href={'/src/home'}><li className="headerLink">Mi Lista</li></Link>}
        {scrollToMy != null ? <li onClick={scrollToMy} className="headerLink">Mis Cursos</li> : <Link href={'/src/home'}><li className="headerLink">Mis Cursos</li></Link>}
        
        </ul>
      </div>
      <div className="flex items-center space-x-4 text-sm font-light">
      { user?.rol === 'Admin' ? (
            <>
            <Link href={'/admin'}>
              <Cog8ToothIcon className="hidden h-6 w-6 sm:inline cursor-pointer" />
            </Link>
            </>
          ) : null
          }
        <MagnifyingGlassIcon className="hidden h-6 w-6 sm:inline cursor-pointer" />
        <p className="hidden lg:inline">Mis cursos</p>
        <BellIcon className="h-6 w-6 cursor-pointer" />
        {/* <Link href="/account"> */}
        <Link href={'user/account'}>
          <img
            src="https://rb.gy/g1pwyx"
            alt=""
            className="cursor-pointer rounded"
            
          />
        </Link>

        {/* </Link> */}
      </div>
    </header>
  );
};

export default Header;
