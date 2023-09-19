
import axios from 'axios';
import { User } from '../../../../typings';

interface Props {
  user: User;
  email: string;
}

export const loadUser = async (email: string, user: User, route: string) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const { data } = await axios.post(route, { email }, config);
    return data || user;
  } catch (error: any) {
    return error.message;
  }
};
