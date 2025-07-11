import connectDB from '../../../config/connectDB';
import Classes from '../../../models/classModel';
import Courses from '../../../models/courseModel';
import User from '../../../models/userModel';

connectDB();

const updateCourses = async (req, res) => {
  try {
    if (req.method === 'PUT') {
      const courses = await Courses.find({});

      for (let index = 0; index < courses.length; index++) {
        const course = courses[index];
        const youtubeURL = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${course.playlist_code}&maxResults=50&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`;

        const initial = await fetch(youtubeURL);
        const data = await initial.json();
        const items = data.items;

        for (let index = 0; index < items.length; index++) {
          const item = items[index];

          const newClass = await new Classes({
            id: index + 1,
            name: item.snippet.title,
            class_code: item.snippet.resourceId.videoId,
            image_url: item.snippet.thumbnails.standard.url,
            course: course
          }).save();

          course.classes.push(newClass);
          await course.save();
        }
      }
      const adminUsers = await User.find({
        rol: 'Admin'
      });
      adminUsers.forEach(async (user) => {
        user.notifications.push({
          title: 'Curso actualizado',
          message: `Has actualizado los cursos con exito`,
          status: 'green'
        });
        await user.save();
      });

      return res.status(200).send({ message: 'hola' });
    } else {
      return res.status(401).json({ error: 'Algo salio mal' });
    }
  } catch (err) {
    return res.status(401).json({ error: 'Algo salio mal' });
  }
};

export default updateCourses;
