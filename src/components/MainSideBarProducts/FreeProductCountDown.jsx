import { useCallback, useEffect, useState } from "react";
const Timer2 = () => {
  const [countDownTime, setCountDownTIme] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });
  const getTimeDifference = (countDownTime) => {
    const currentTime = new Date().getTime();
    const timeDiffrence = countDownTime - currentTime;
    let days =
      Math.floor(timeDiffrence / (24 * 60 * 60 * 1000)) >= 10
        ? Math.floor(timeDiffrence / (24 * 60 * 60 * 1000))
        : `0${Math.floor(timeDiffrence / (24 * 60 * 60 * 1000))}`;
    const hours = `00`;
    const minutes = `05`;
    const seconds =
      Math.floor((timeDiffrence % (60 * 1000)) / 1000) >= 10
        ? Math.floor((timeDiffrence % (60 * 1000)) / 1000)
        : `0${Math.floor((timeDiffrence % (60 * 1000)) / 1000)}`;
    if (timeDiffrence < 0) {
      setCountDownTIme({
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
      });
      clearInterval();
    } else {
      setCountDownTIme({
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds,
      });
    }
  };
  const startCountDown = useCallback(() => {
    const customDate = new Date();
    const countDownDate = new Date(
      customDate.getFullYear(),
      customDate.getMonth() + 1,
      customDate.getDate() + 6,
      customDate.getHours(),
      customDate.getMinutes(),
      customDate.getSeconds() + 1
    );
    setInterval(() => {
      getTimeDifference(countDownDate.getTime());
    }, 1000);
  }, []);
  useEffect(() => {
    startCountDown();
  }, [startCountDown]);
  return (
      <div className="mx-3 sm:p-10 p-4 rounded-md flex justify-center flex-col gap-6 shadow-[5px_5px_50px_rgba(47,46,60,1)] font-montserrat">
        <div className="flex flex-col gap-2">
          <h1 className="text-center sm:text-3xl text-xl font-semibold leading-8 text-[#141414]">
            Apurate, Disponibilidad Limitada
          </h1>
          <span className="text-sm font-semibold capitalize text-center leading-8 text-[#959AAE]">
            Se parte de nuestra comunidad, aprovecha esta oportunidad antes de que se termine!
          </span>
        </div>
        <div className="flex space-x-2 justify-center sm:px-4">
          <div className="flex flex-col justify-center items-center">
            <div className="flex flex-col justify-center items-center gap-3">
              <span className="py-3 px-3 bg-[#141414] text-light-cream text-3xl font-semibold rounded-md">
                {countDownTime?.hours}
              </span>
              <span className="text-sm text-[#FBFAF8] font-bold">
                {countDownTime?.hours == 1 ? "Hour" : "Hours"}
              </span>
            </div>
            <p className="text-black -mt-6 text-xs md:text-sm">Horas</p>

          </div>
          <div className="flex flex-col justify-center items-center">
          <div className="flex flex-col justify-center items-center gap-3">
            <span className="py-3 px-3 bg-[#141414] text-light-cream text-3xl font-semibold rounded-md">
              {countDownTime?.minutes}
            </span>
            <span className="text-sm text-[#FBFAF8] font-bold">
              {countDownTime?.minutes == 1 ? "Minute" : "Minutes"}
            </span>
          </div>
          <p className="text-black -mt-6 text-xs md:text-sm">Minutos</p>
          </div>
          <div className="flex flex-col justify-center items-center">
          <div className="flex flex-col justify-center items-center gap-3">            <span className="py-3 px-3 bg-[#141414] text-light-cream text-3xl font-semibold rounded-md">
              {countDownTime?.seconds}
            </span>
            <span className="text-sm text-[#FBFAF8] font-bold">
              {countDownTime?.seconds == 1 ? "Second" : "Seconds"}
            </span>
          </div>
          <p className="text-black -mt-6 text-xs md:text-sm">Segundos</p>
          </div>
        </div>
      </div>
  );
};
export default Timer2;
