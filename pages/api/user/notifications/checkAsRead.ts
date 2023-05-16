import connectDB from '../../../../config/connectDB';
import Users from '../../../../models/userModel';
import { Notification } from '../../../../typings';

connectDB();

const checkAsRead = async (req: any, res: any) => {
  const { userId } = req.body;
  try {
    if (req.method === 'PUT') {
      const dbUser = await Users.findOne({ _id: userId.valueOf() });

      dbUser.notifications.filter((x: Notification) => !x.read).slice(-5)
        .length > 0
        ? dbUser.notifications
            .filter((x: Notification) => !x.read)
            .slice(-5)
            .forEach((noti: Notification) => {
              noti.read = true;
            })
        : res.status(304).send(dbUser);

      await dbUser.save();

      return res.status(200).send(dbUser);
    } else {
      return res.status(401).json({ error: 'Algo salio mal' });
    }
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: 'Algo salio mal' });
  }
};
export default checkAsRead;
