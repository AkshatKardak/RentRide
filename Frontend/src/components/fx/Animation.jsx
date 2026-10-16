// Fade animations
export const FadeUp = (delay = 0) => {
  return {
    hidden: {
      opacity: 0,
      y: 100,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay: delay,
      },
    },
  };
};

export const FadeDown = (delay = 0) => {
  return {
    hidden: {
      opacity: 0,
      y: -100,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay: delay,
      },
    },
  };
};

export const FadeLeft = (delay = 0) => {
  return {
    hidden: {
      opacity: 0,
      x: 100,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 10,
        delay: delay,
      },
    },
  };
};

export const FadeRight = (delay = 0) => {
  return {
    hidden: {
      opacity: 0,
      x: -100,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 10,
        delay: delay,
      },
    },
  };
};

// Scale animations
export const ScaleUp = (delay = 0) => {
  return {
    hidden: {
      opacity: 0,
      scale: 0.5,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 15,
        delay: delay,
      },
    },
  };
};

export const ZoomIn = (delay = 0) => {
  return {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: delay,
      },
    },
  };
};

// Rotate animations
export const RotateIn = (delay = 0) => {
  return {
    hidden: {
      opacity: 0,
      rotate: -180,
      scale: 0.5,
    },
    visible: {
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: {
        duration: 1,
        ease: "easeOut",
        delay: delay,
      },
    },
  };
};

// Slide animations
export const SlideInFromLeft = (delay = 0) => {
  return {
    hidden: {
      opacity: 0,
      x: -200,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 12,
        delay: delay,
      },
    },
  };
};

export const SlideInFromRight = (delay = 0) => {
  return {
    hidden: {
      opacity: 0,
      x: 200,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 12,
        delay: delay,
      },
    },
  };
};

// Stagger container for lists
export const StaggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

// Floating animation (continuous loop)
export const FloatingAnimation = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Pulse animation (continuous loop)
export const PulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Blur fade in
export const BlurFadeIn = (delay = 0) => {
  return {
    hidden: {
      opacity: 0,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 1,
        delay: delay,
      },
    },
  };
};
