import connectDB from "../../../config/connectDB"


const connectBeforeSSR =  async (req, res) => {
    try {
        connectDB()
        console.log('connect bk')
        return res.status(200).json({message: 'connected' })
    } catch (err) {
      console.log(err)
      return res.status(401).json({ error: "Algo salio mal" })  }
  }
  
  export default connectBeforeSSR