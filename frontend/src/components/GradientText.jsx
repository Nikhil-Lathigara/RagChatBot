import React from "react";

export default function GradientText({ children }) {
  return <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">{children}</span>;
}
