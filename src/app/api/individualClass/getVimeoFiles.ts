import axios from 'axios';

const getVimeoData = async () => {
  const accessToken = process.env.VIMEO_ACCESS_TOKEN;
  const url = 'https://api.vimeo.com/videos/894646154';

  try {
    const response = await axios.get(url, {
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

export default getVimeoData;