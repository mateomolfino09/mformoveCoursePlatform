import axios from 'axios';

const getVimeoVideo = async (videoId: string) => {
  const accessToken = process.env.VIMEO_ACCESS_TOKEN;
  const url = `https://api.vimeo.com/videos/${videoId}`;

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

export default getVimeoVideo;