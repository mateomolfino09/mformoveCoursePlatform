import Class from '../../../models/classModel';

export async function getClassById(id, courseId) {
  try {
    const res = await Class.where('id')
      .equals(id)
      .populate({ path: 'course', match: { id: courseId } })
      .exec();
    const courseToSend = res.filter((r) => r.course != null);

    const clase = JSON.parse(JSON.stringify(courseToSend[0]));
    return clase;
  } catch (err) {
    console.log(err);
  }
}
