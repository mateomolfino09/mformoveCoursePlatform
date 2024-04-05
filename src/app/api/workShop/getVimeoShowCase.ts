import axios from 'axios';

const getVimeoShowCase = async (workShopVimeoId: number) => {
  const accessToken = process.env.VIMEO_ACCESS_TOKEN;
  try {
    //https://api.vimeo.com/videos/894646154/pictures/1768946000`
    const response = await axios.get(`https://api.vimeo.com/me/albums/${workShopVimeoId}/videos`, {
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