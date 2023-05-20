import React, {useState, useContext, createContext, useCallback} from "react";
import Cookie from 'js-cookie'
import axios from "axios";
import endpoints from "../services/api";
import { User } from "../../typings";
import { serialize } from "v8";

const AuthContext = createContext<any>(null);

export function ProviderAuth({ children }: any) {
    const auth = useProvideAuth()

    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    return useContext(AuthContext)
}

function useProvideAuth() {
	const [user, setUser] = useState<User | null>(null);
	const [error, setError]=useState();

	const fetchUser = async () => {
		try {
		  const token = Cookie.get('userToken');	
	
		  if (token) {
			axios.defaults.headers.Authorization = `Bearer ${token}`;
			const { data: user } = await axios.get(endpoints.auth.profile);
	
			setUser(user);
			return user
		  }
		} catch (error) {
		  setUser(null);
		}
	  };


	const signIn = async (email: string, password: string) => {
		const options = {
			headers: {
				accept: '*/*',
				'Content-Type': 'application/json',
			}
		}
		const { data: login } = await axios.post(endpoints.auth.login, { email, password }, options);

		//get profile
		if(login.login) {
			const token = login.token;
			Cookie.set('userToken', token, { expires: 5})
			axios.defaults.headers.Authorization = ` Bearer ${token}`;
			const { data: user } = await axios.get(endpoints.auth.profile);
			setUser(user)

		}
	};

	const setUserBack = (user: User) => {
		setUser(user)
	}

	return {
		user,
		error,
		setError,
		signIn,
		fetchUser,
		setUserBack
	  };
}