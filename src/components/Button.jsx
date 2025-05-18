import React from "react";

const Button = ({ children, className }) => {
  return (
    <button
      className={`px-4 flex gap-2 items-center justify-center hover:brightness-[90%] transition-color py-1 bg-blue-400 rounded-md cursor-pointer h-10 text-white font-semibold border-b-4 border-blue-500 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
