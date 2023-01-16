import Course from "../../../models/courseModel"

export async function getCourseById( id ) {
try {
    let course = await Course.findOne({ id: id })
    course = JSON.parse(JSON.stringify(course))
    console.log(course)
    return course
    } catch (err) {
    console.log(err)
    }
}
  