import React, { useState } from "react";
import { AiOutlineCheckCircle } from "react-icons/ai";
import Select, { StylesConfig } from "react-select";
import ReCAPTCHA from "react-google-recaptcha";
import { useRouter } from "next/router";

const colourStyles: StylesConfig<any> = {
  control: (styles) => ({
    ...styles,
    backgroundColor: "#333",
    height: 55,
    borderRadius: 6,
    padding: 0,
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    return { ...styles, color: "#808080" };
  },
  input: (styles) => ({ ...styles, backgroundColor: "", color: "#fff" }),
  placeholder: (styles) => ({ ...styles, color: "#fff" }),
  singleValue: (styles, { data }) => ({ ...styles, color: "#808080" }),
};

interface Props {
  user: any;
  signUp: any;
  onChange: any;
  recaptchaRef: any;
}

const RegisterStepOne = ({ user, signUp, onChange, recaptchaRef }: Props) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const key =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY != undefined
      ? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
      : "";

  const handleClick = () => {
    router.push("/src/user/login");
  };

  return (
    <div
      className={`h-full w-full relative flex flex-col md:items-center md:justify-center bg-white`}
    >
      {/* Logo position */}
      <div className="flex flex-col items-center justify-center relative mt-8 sm:mt-24 space-y-4 rounded py-12 md:-mt-0">
        <AiOutlineCheckCircle className="text-light-red w-12 h-12" />
        <p className="font-extralight text-black text-base">PASO 3 DE 3</p>
        <h1 className="mx-1 font-extrabold text-4xl text-center text-black">
          Solo resta que confirmes tus datos!
        </h1>
      </div>
      <div className=" mb-2 ml-9 sm:ml-0 flex flex-col justify-center sm:items-center ">
        <div className=" flex flex-col sm:flex-row justify-center sm:items-center w-auto sm:w-96 h-12 overflow-visible  mb-2 sm:mb-0">
          <label className="text-black text-base text-start w-24 ">
            Email:
          </label>
          <input
            className="text-black text-base text-start w-full md:ml-10"
            type="text"
            value={user.email}
            readOnly
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-center sm:items-center w-auto sm:w-96 h-12   mb-2 sm:mb-0">
          <label className="text-black text-base text-start w-24">
            Nombre:
          </label>
          <input
            className="text-black text-base text-start  w-full md:ml-10"
            type="text"
            value={user.firstname}
            readOnly
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-center sm:items-center w-auto sm:w-96 h-12   mb-2 sm:mb-0">
          <label className="text-black text-base text-start w-24">
            Apellido:
          </label>
          <input
            className="text-black text-base text-start w-full md:ml-10"
            type="text"
            value={user.lastname}
            readOnly
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-center sm:items-center w-auto sm:w-96 h-12   mb-2 sm:mb-0">
          <label className="text-black text-base text-start w-24">
            Género:
          </label>
          <input
            className="text-black text-base text-start w-full md:ml-10"
            type="text"
            value={user.gender}
            readOnly
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-center sm:items-center w-auto sm:w-96 h-12   mb-2 sm:mb-0">
          <label className="text-black text-base text-start w-24">País:</label>
          <input
            className="text-black text-base text-start w-full md:ml-10"
            type="text"
            value={user.country}
            readOnly
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-center sm:items-center w-auto sm:w-96 h-12   mb-2 sm:mb-0">
          <label className="text-black text-base text-start w-24">
            Password:
          </label>
          <input
            className="text-black text-base text-start w-full md:ml-10"
            type="text"
            value={user.password}
            readOnly
          />
        </div>
      </div>
      <ReCAPTCHA
        onChange={onChange}
        ref={recaptchaRef}
        sitekey={key}
        className="mt-8 mb-6 my-auto flex justify-center"
      />
      <div className="flex flex-row items-center justify-evenly relative space-x-8 rounded px-8 md:w-full mb-10">
        <button
          onClick={() => handleClick()}
          className="w-64 bg-black/70 border border-white rounded-md transition duration-500 hover:bg-black py-3 font-semibold"
        >
          Volver{" "}
        </button>

        <button
          onClick={(e) => signUp(e)}
          className="w-64 bg-black/70 border border-white rounded-md transition duration-500 hover:bg-black py-3 font-semibold"
        >
          Crear Cuenta{" "}
        </button>
      </div>
    </div>
  );
};

export default RegisterStepOne;
