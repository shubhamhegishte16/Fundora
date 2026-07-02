import React from "react";
import { motion } from "framer-motion";

const WelcomePanel = ({ onSignInClick }) => {
  return (
    <div className="relative w-full lg:w-2/5 min-h-[250px] lg:min-h-[600px] bg-dark-green text-white overflow-hidden flex flex-col justify-between p-8 lg:p-12 select-none">
      {/* Abstract Geometric Polygons (Figma overlay style) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        {/* Layer 1 - Large Diagonal Polygon */}
        <div className="absolute -top-[20%] -left-[10%] w-[120%] h-[80%] bg-primary-green opacity-30 transform -rotate-12 origin-top-left rounded-b-[100px]" />
        
        {/* Layer 2 - Intersecting Polygon */}
        <div className="absolute top-[30%] -right-[20%] w-[100%] h-[70%] bg-light-green opacity-20 transform rotate-45 origin-bottom-right rounded-t-[80px]" />
        
        {/* Layer 3 - Diamond accent */}
        <div className="absolute bottom-[10%] left-[5%] w-48 h-48 bg-primary-green opacity-20 transform rotate-45 rounded-3xl" />
        
        {/* Layer 4 - Subtle top-right accent */}
        <div className="absolute -top-10 right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl" />
      </div>

      {/* Content Container (Ensure it sits above the background) */}
      <div className="relative z-10 flex flex-col justify-between h-full w-full grow">
        {/* Top Empty Spacer/Logo Area */}
        <div className="flex items-center justify-start">
          <span className="text-xl font-extrabold tracking-wider bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
            ELPIS
          </span>
        </div>

        {/* Center Welcome Text */}
        <div className="my-auto py-12 text-center lg:text-left">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-3xl sm:text-4xl font-black tracking-widest leading-tight"
          >
            WELCOME
            <br />
            TO
            <br />
            ELPIS
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-4 text-xs tracking-wider uppercase hidden lg:block text-light-green"
          >
            Empowering creators. Connecting donors.
          </motion.div>
        </div>

        {/* Bottom Sign In Call to Action */}
        <div className="flex flex-col items-center lg:items-start gap-3 mt-auto border-t border-white/15 pt-6">
          <span className="text-sm font-medium text-white/80">Already a member?</span>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onSignInClick}
            type="button"
            className="px-8 py-2.5 rounded-full border-2 border-white/60 text-white font-semibold tracking-wide text-sm hover:border-white transition-all cursor-pointer shadow-md shadow-black/10 focus:outline-none focus:ring-2 focus:ring-light-green"
          >
            Sign In
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePanel;
