'use client'
import React, {useState, useContext, createContext, useCallback} from "react";
import Cookie from 'js-cookie'
import axios from "axios";
import endpoints from "../services/api";
import { User } from "../../typings";
import { serialize } from "v8";
import state from "../valtio";

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
	const [error, setError]=useState<String | null>(null);

	const fetchUser = async () => {
		try {
		  const token = Cookie.get('userToken');	

		  Cookie.set('userToken', token ? token : '', { expires: 5})
	
		  if (token) {
			const res = await fetch(endpoints.auth.profile, {
				method: 'GET',
				headers: {  
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				})
			const user = await res.json()
			setUser(user.user)
			return user
		  }
		} catch (error) {
		  setUser(null);
		}
	  };

	const signIn = async (email: string, password: string) => {
		try {
			setError(null)
			const res = await fetch(endpoints.auth.login, {
				method: 'POST',
				headers: {  
				  'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			  })

			const data = await res.json()

			const { login, token, message, error } = data
			
			//get profile
			if(login) {
				Cookie.set('userToken', token, { expires: 5})
				const res = await fetch(endpoints.auth.profile, {
					method: 'GET',
					headers: {  
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					},
					})

				


				const user = await res.json()
				setUser(user.user)
				return {message:'Login Exitoso', type: 'success', user: user.user}
				
			}
			else if(message) return {message: message, type: 'error'} 
			else return {message: error, type: 'error'};
			
		} catch (error: any) {
			setError(error.response.data.message)
			return {message: error.response.data.message, type: 'error'} 
		}
	};

	const signInPostRegister = async (token: string) => {
		try {
			setError(null)	
			Cookie.set('userToken', token, { expires: 5})
			const res = await fetch(endpoints.auth.profile, {
				method: 'GET',
				headers: {  
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				})


			const user = await res.json()
			setUser(user.user)
			return {message:'Login Exitoso', type: 'success'}
							
		} catch (error: any) {
			setError(error.response.data.message)
			return {message: error.response.data.message, type: 'error'} 
		}
	};

	const quickSignIn = async (email: string, password: string) => {
		try {
			setError(null)
			const res = await fetch(endpoints.auth.login, {
				method: 'POST',
				headers: {  
				  'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			  })

			const data = await res.json()

			const { login, token, message, error } = data
			
			//get profile
			if(login) {
				Cookie.set('userToken', token, { expires: 5})
				const res = await fetch(endpoints.auth.profile, {
					method: 'GET',
					headers: {  
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					},
					})


				const user = await res.json()
				setUser(user.user)
				return {message:'Login Exitoso', type: 'success'}
				
			}
			else if(message) return {message: message, type: 'error'} 
			else return {message: error, type: 'error'};
			
		} catch (error: any) {
			setError(error.response.data.message)
			return {message: error.response.data.message, type: 'error'} 
		}
	};

	const signOut = () => {
		Cookie.remove('userToken');
		setUser(null);
	};

	const setUserBack = (user: User) => {
		setUser(user)
	}

	const resetPassword = async (pass: string, conPass: string, token: string) => {
		try {	
			const res = await fetch(endpoints.auth.resetPassword(token), {
				method: 'PUT',
				headers: {  
				  'Content-Type': 'application/json',
				  'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ password: pass, conPassword: conPass, token: token }),
			  })

			const data = await res.json()
			debugger;
			// signOut()
			setUser(data.user)
			return data
		} catch (error) {
		  setUser(null);
		}
	  };
	
	  const forgetPasswordSend = async (email: string, captcha: string) => {
		try {	
			const res = await fetch(endpoints.auth.resetPasswordSend, {
				method: 'POST',
				headers: {  
				  'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, captcha }),
			  })

			const data = await res.json()
			return data
		} catch (error) {
		  setUser(null);
		}
	  };

	  const forgetPasswordSendNoCaptcha = async (email: string) => {
		try {	
			const res = await fetch(endpoints.auth.resetPasswordSendNoCaptcha, {
				method: 'POST',
				headers: {  
				  'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email }),
			  })

			const data = await res.json()
			return data
		} catch (error) {
		  setUser(null);
		}
	  };



	  const resetPasswordSendMailchamp = async (email: string) => {
		try {	
			const res = await fetch('/api/auth/resetPasswordMailChamp', {
				method: 'POST',
				headers: {
				  'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email }),
			  });
		  
			  const data = await res.json();
			  return data;
		} catch (error) {
		  setUser(null);
		}
	  };


	  const resetMailSend = async (email: string) => {
		try {	
			const res = await fetch(endpoints.auth.resetMailSend, {
				method: 'POST',
				headers: {  
				  'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email }),
			  })

			const data = await res.json()
			return data
		} catch (error) {
		  setUser(null);
		}
	  };

	const resetMail = async (email: string, token: string) => {
		try {	
			const res = await fetch(endpoints.auth.resetMail(token), {
				method: 'PUT',
				headers: {  
				  'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email }),
			  })

			const data = await res.json()
			signOut()
			setUser(null)
			return data
		} catch (error) {
		  setUser(null);
		}
	  };



	  const newSub = async (idUser: string, planId: string) => {
		if(!idUser) return
		try {	
			const res = await fetch(endpoints.payments.createSub, {
				method: 'PUT',
				headers: {  
				  'Content-Type': 'application/json',
				},
				body: JSON.stringify({ idUser, planId }),
			  })

			const data = await res.json()
			setUser(data)
			return data
		} catch (error) {
			return error
		}
	  };

	  const cancelSub = async (planId: string, subscriptionId: string, id: string, message: string) => {
		try {
			const res = await fetch(endpoints.payments.cancelSubscription(subscriptionId), {
				method: 'PUT',
				headers: {  
				  'Content-Type': 'application/json',
				   accept: '*/*',
				},
				body: JSON.stringify({ subscriptionId, planId, id, message }),
			  })

			const data = await res.json();
			
			setUser(data.user);
			return data
		} catch (error) {
		}
	  };


	  const newMembership = async (idUser: string, paymentToken:string) => {
		if(!idUser) return
		try {	
			const res = await fetch(endpoints.payments.createMembership, {
				method: 'PUT',
				headers: {  
				  'Content-Type': 'application/json',
				},
				body: JSON.stringify({ idUser, paymentToken }),
			  })

			const data = await res.json()
			setUser(data.user)
			return data
		} catch (error) {
			return error
		}
	  };

	  const newProductUser = async (idUser: string, paymentToken:string, productId: string) => {
		if(!idUser) return
		try {	
			const res = await fetch(endpoints.payments.createProductUser, {
				method: 'PUT',
				headers: {  
				  'Content-Type': 'application/json',
				},
				body: JSON.stringify({ idUser, paymentToken, productId }),
			  })

			const data = await res.json()
			setUser(data.user)
			return data;
		} catch (error) {
			return error
		}
	  };

	return {
		user,
		error,
		setError,
		signIn,
		signInPostRegister,
		signOut,
		fetchUser,
		setUserBack,
		resetPassword,
		resetMail,
		resetMailSend,
		forgetPasswordSend,
		forgetPasswordSendNoCaptcha,
		resetPasswordSendMailchamp,
		newSub,
		cancelSub,
		newMembership,
		newProductUser
	  };
}