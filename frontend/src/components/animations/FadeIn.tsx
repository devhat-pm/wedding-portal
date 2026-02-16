import { motion, type Variants } from 'framer-motion';

type FadeDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: FadeDirection;
  distance?: number;
  className?: string;
  style?: React.CSSProperties;
  once?: boolean;
  threshold?: number;
  as?: 'div' | 'span' | 'section' | 'article' | 'main' | 'header' | 'footer' | 'aside' | 'nav' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'ul' | 'ol' | 'li';
}

const getDirectionOffset = (direction: FadeDirection, distance: number) => {
  switch (direction) {
    case 'up':
      return { y: distance };
    case 'down':
      return { y: -distance };
    case 'left':
      return { x: distance };
    case 'right':
      return { x: -distance };
    case 'none':
    default:
      return {};
  }
};

const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  distance = 30,
  className,
  style,
  once = true,
  threshold = 0.1,
  as = 'div',
}) => {
  const directionOffset = getDirectionOffset(direction, distance);

  const variants: Variants = {
    hidden: {
      opacity: 0,
      ...directionOffset,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1], // Smooth easing
      },
    },
  };

  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionComponent
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      variants={variants}
      className={className}
      style={style}
    >
      {children}
    </MotionComponent>
  );
};

// Stagger container for multiple children
interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.1,
  className,
  style,
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

// Stagger item for use inside StaggerContainer
interface StaggerItemProps {
  children: React.ReactNode;
  direction?: FadeDirection;
  distance?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  direction = 'up',
  distance = 20,
  className,
  style,
}) => {
  const directionOffset = getDirectionOffset(direction, distance);

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      ...directionOffset,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className} style={style}>
      {children}
    </motion.div>
  );
};

export default FadeIn;
