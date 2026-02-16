import { motion, AnimatePresence, type Variants } from 'framer-motion';

interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  initialScale?: number;
  className?: string;
  style?: React.CSSProperties;
  once?: boolean;
  threshold?: number;
  springConfig?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
}

const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  delay = 0,
  duration,
  initialScale = 0.8,
  className,
  style,
  once = true,
  threshold = 0.1,
  springConfig = { stiffness: 200, damping: 20, mass: 1 },
}) => {
  const variants: Variants = {
    hidden: {
      opacity: 0,
      scale: initialScale,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: duration
        ? {
            duration,
            delay,
            ease: [0.25, 0.1, 0.25, 1],
          }
        : {
            type: 'spring',
            delay,
            ...springConfig,
          },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      variants={variants}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

// Pop in with bounce effect (great for success states)
interface PopInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const PopIn: React.FC<PopInProps> = ({
  children,
  delay = 0,
  className,
  style,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 15,
        delay,
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

// Bounce in (for checkmarks, success icons)
interface BounceInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  show?: boolean;
}

export const BounceIn: React.FC<BounceInProps> = ({
  children,
  delay = 0,
  className,
  style,
  show = true,
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0, rotate: 180 }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 25,
            delay,
          }}
          className={className}
          style={style}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Pulse animation (for attention)
interface PulseProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  intensity?: number;
}

export const Pulse: React.FC<PulseProps> = ({
  children,
  className,
  style,
  intensity = 1.05,
}) => {
  return (
    <motion.div
      animate={{
        scale: [1, intensity, 1],
      }}
      transition={{
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity,
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

// Card hover scale effect
interface HoverScaleProps {
  children: React.ReactNode;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const HoverScale: React.FC<HoverScaleProps> = ({
  children,
  scale = 1.02,
  className,
  style,
}) => {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

// Modal scale in
interface ModalScaleProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ModalScale: React.FC<ModalScaleProps> = ({
  children,
  isOpen,
  onClose,
  className,
  style,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'black',
              zIndex: 1000,
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
            }}
            className={className}
            style={{
              position: 'fixed',
              zIndex: 1001,
              ...style,
            }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Sequence animation for color swatches, list items, etc.
interface SequenceItemProps {
  children: React.ReactNode;
  index: number;
  baseDelay?: number;
  staggerDelay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const SequenceItem: React.FC<SequenceItemProps> = ({
  children,
  index,
  baseDelay = 0,
  staggerDelay = 0.1,
  className,
  style,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: baseDelay + index * staggerDelay,
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

export default ScaleIn;
