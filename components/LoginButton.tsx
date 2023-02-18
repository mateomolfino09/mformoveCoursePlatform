import next from "next";
import React from "react";
import { signIn } from "next-auth/react";
import { GoogleLoginButton } from "react-social-login-buttons";

function LoginButton({ provider, bgColor, txtColor }: any) {
  return (
    <div>
      <button
        className="w-full rounded bg-light-red py-3 font-semibold -mt-6"
        style={{ background: `${bgColor}`, color: `${txtColor}` }}
        onClick={() => signIn(provider.id)}
      >
        Sign In con {provider.name}
      </button>
    </div>
  );
}

LoginButton.defaultProps = {
  txtColor: "#eee",
};

export default LoginButton;
