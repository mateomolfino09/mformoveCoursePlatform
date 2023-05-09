const getCourseInfo = async (req, res) => {
  const { youtubeURL } = req.body
  try {
    if (req.method === 'POST') {
      const initial = await fetch(youtubeURL)
      const data = await initial.json()
      return res.status(200).send(data)
    } else {
      return res.status(401).json({ error: 'Algo salio mal' })
    }
  } catch (err) {
    console.log(err)
    return res.status(401).json({ error: 'Algo salio mal' })
  }
}

export default getCourseInfo
