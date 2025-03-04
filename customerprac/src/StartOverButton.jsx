// StartOverButton.jsx
import { motion } from "framer-motion";

const StartOverButton = ({ resetChat }) => {
  return (
    <motion.button
      onClick={resetChat}
      className="text-xs py-1 px-2 font-medium bg-red-600 bg-opacity-50 rounded-l-lg"
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.2 }}
    >
      Start Over
    </motion.button>
  );
};

export default StartOverButton;