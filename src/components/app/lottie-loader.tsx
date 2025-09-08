"use client";

import Lottie from "lottie-react";
import animationData from "../../../public/animations/cat-animation.json";

export function LottieLoader() {
  return (
    <Lottie
      animationData={animationData}
      loop={true}
      style={{ width: 150, height: 150 }}
    />
  );
}
