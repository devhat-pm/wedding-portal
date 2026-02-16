import { motion, type Variants } from 'framer-motion';

type SlideDirection = 'left' | 'right' | 'top' | 'bottom';

interface SlideInProps {
  children: React.ReactNode;
  direction?: SlideDirection;
  delay?: number;
  duration?: number;
  distance?: number | string;
  className?: string;
  style?: React.CSSProperties;
  once?: boolean;
  threshold?: number;
}

const getSlideOffset = (direction: SlideDirection, distance: number | string) => {
  const distanceValue = typeof distance === 'number' ? `${distance}px` : distance;

  switch (direction) {
    case 'left':
      return { x: `-${distanceValue}` };
    case 'right':
      return { x: distanceValue };
    case 'top':
      return { y: `-${distanceValue}` };
    case 'bottom':
      return { y: distanceValue };
    default:
      return {};
  }
};

const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'left',
  delay = 0,
  duration = 0.6,
  distance = 100,
  className,
  style,
  once = true,
  threshold = 0.1,
}) => {
  const slideOffset = getSlideOffset(direction, distance);

  const variants: Variants = {
    hidden: {
      opacity: 0,
      ...slideOffset,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94], // Smooth deceleration
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

// Slide panel for modals and drawers
interface SlidePanelProps {
  children: React.ReactNode;
  isOpen: boolean;
  direction?: SlideDirection;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  onAnimationComplete?: () => void;
}

export const SlidePanel: React.FC<SlidePanelProps> = ({
  children,
  isOpen,
  direction = 'right',
  duration = 0.3,
  className,
  style,
  onAnimationComplete,
}) => {
  const getOffset = () => {
    switch (direction) {
      case 'left':
        return { x: '-100%' };
      case 'right':
        return { x: '100%' };
      case 'top':
        return { y: '-100%' };
      case 'bottom':
        return { y: '100%' };
    }
  };

  return (
    <motion.div
      initial={getOffset()}
      animate={isOpen ? { x: 0, y: 0 } : getOffset()}
      transition={{
        duration,
        ease: [0.32, 0.72, 0, 1], // Custom easing for panel
      }}
      onAnimationComplete={onAnimationComplete}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

// Slide with overlay for modals
interface SlideOverlayProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  direction?: SlideDirection;
  overlayOpacity?: number;
  className?: string;
}

export const SlideOverlay: React.FC<SlideOverlayProps> = ({
  children,
  isOpen,
  onClose,
  direction = 'right',
  overlayOpacity = 0.5,
  className,
}) => {
  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? overlayOpacity : 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'black',
          zIndex: 1000,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      />

      {/* Panel */}
      <SlidePanel
        isOpen={isOpen}
        direction={direction}
        className={className}
        style={{
          position: 'fixed',
          zIndex: 1001,
          ...(direction === 'left' && { left: 0, top: 0, bottom: 0 }),
          ...(direction === 'right' && { right: 0, top: 0, bottom: 0 }),
          ...(direction === 'top' && { top: 0, left: 0, right: 0 }),
          ...(direction === 'bottom' && { bottom: 0, left: 0, right: 0 }),
        }}
      >
        {children}
      </SlidePanel>
    </>
  );
};

export default SlideIn;
