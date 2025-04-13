import React, { useEffect, useState } from "react";
import "./SplashScreen.css";

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    // Start the animation after a small delay to ensure everything is loaded
    const startTimeout = setTimeout(() => {
      setAnimationStarted(true);
    }, 100);

    // Set a timeout to call the onAnimationComplete callback after the animation duration
    const animationDuration = 2000; // 2 seconds
    const completeTimeout = setTimeout(() => {
      onAnimationComplete();
    }, animationDuration + 100); // Add a small buffer

    // Clean up timeouts
    return () => {
      clearTimeout(startTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onAnimationComplete]);

  return (
    <div className={`splash-screen ${animationStarted ? "animate" : ""}`}>
      <div className="splash-image-container">
        <img
          src={`${process.env.PUBLIC_URL}/assets/images/Spy_Pose.png`}
          alt="Splash Screen"
          className="splash-image"
        />
        <div className="burn-effect"></div>
      </div>
    </div>
  );
};

export default SplashScreen;
