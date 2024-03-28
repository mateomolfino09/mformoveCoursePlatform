import axios from 'axios';

const getVimeoShowCase = async (showcaseId: string) => {
  const accessToken = process.env.VIMEO_ACCESS_TOKEN;

  try {
    const a = 11059981
    //https://api.vimeo.com/videos/894646154/pictures/1768946000`
    const response = await axios.get(`https://api.vimeo.com/me/albums/11059981/videos`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
          },
      });


    const data = response.data;

    return data
  } catch (error) {
    console.error('Error fetching Vimeo data:', error);
  }
};

export default getVimeoShowCase;