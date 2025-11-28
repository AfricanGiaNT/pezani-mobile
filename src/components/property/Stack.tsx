import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useDragControls } from 'framer-motion';

interface CardData {
  id: number | string;
  img: string;
}

interface StackProps {
  cardsData: CardData[];
  cardDimensions?: { width: number; height: number };
  randomRotation?: boolean;
  sensitivity?: number;
  sendToBackOnClick?: boolean;
}

const Stack = ({
  cardsData,
  cardDimensions = { width: 300, height: 400 },
  randomRotation = true,
  sensitivity = 180,
  sendToBackOnClick = false,
}: StackProps) => {
  const [cards, setCards] = useState<CardData[]>(cardsData);
  const [rotations, setRotations] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate random rotations for each card
  useEffect(() => {
    if (randomRotation) {
      const newRotations = cards.map(() => 
        (Math.random() - 0.5) * 6 // Random rotation between -3 and 3 degrees
      );
      setRotations(newRotations);
    } else {
      setRotations(new Array(cards.length).fill(0));
    }
  }, [cards, randomRotation]);

  const handleCardClick = (index: number) => {
    if (sendToBackOnClick) {
      const newCards = [...cards];
      const clickedCard = newCards.splice(index, 1)[0];
      newCards.push(clickedCard);
      setCards(newCards);
    }
  };

  const handleCardSwipe = (index: number) => {
    // Move top card (index 0) to back when swiped
    if (index === 0) {
      const newCards = [...cards];
      const swipedCard = newCards.shift(); // Remove first card
      if (swipedCard) {
        newCards.push(swipedCard); // Add to end
        setCards(newCards);
      }
    }
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="relative w-full h-64 md:h-96 bg-gray-200 rounded-xl flex items-center justify-center">
        <span className="text-text-light">No images available</span>
      </div>
    );
  }

  // Responsive dimensions - use CSS classes for mobile responsiveness
  const responsiveWidth = cardDimensions.width;
  const responsiveHeight = cardDimensions.height;

  return (
    <div
      ref={containerRef}
      className="relative w-full flex items-center justify-center"
      style={{
        height: `${responsiveHeight}px`,
        minHeight: '300px',
        maxHeight: '500px',
      }}
    >
      {cards.map((card, index) => {
        // First card (index 0) should be on top and draggable
        const isTop = index === 0;
        // Higher index = lower z-index (first card has highest z-index)
        const zIndex = cards.length - index;
        // First card is full size, others are slightly smaller
        const scale = 1 - index * 0.04;
        // First card is on top, others are offset down
        const yOffset = index * 6;
        
        return (
          <Card
            key={card.id}
            card={card}
            index={index}
            rotation={rotations[index] || 0}
            zIndex={zIndex}
            scale={scale}
            yOffset={yOffset}
            isTop={isTop}
            sensitivity={sensitivity}
            onClick={() => handleCardClick(index)}
            onSwipe={() => handleCardSwipe(index)}
            cardDimensions={{ width: responsiveWidth, height: responsiveHeight }}
          />
        );
      })}
    </div>
  );
};

interface CardProps {
  card: CardData;
  index: number;
  rotation: number;
  zIndex: number;
  scale: number;
  yOffset: number;
  isTop: boolean;
  sensitivity: number;
  onClick: () => void;
  onSwipe: () => void;
  cardDimensions: { width: number; height: number };
}

const Card = ({
  card,
  index,
  rotation,
  zIndex,
  scale,
  yOffset,
  isTop,
  sensitivity,
  onClick,
  onSwipe,
  cardDimensions,
}: CardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  
  // Only use 3D transforms on desktop for better mobile performance
  const rotateZ = useSpring(useTransform(x, [-sensitivity, sensitivity], [-5, 5]), {
    stiffness: 300,
    damping: 30,
  });

  // Transform for drag rotation
  const dragRotateZ = useTransform(dragX, [-300, 300], [-15, 15]);
  const combinedY = useTransform(dragY, (val) => yOffset + val);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || !isTop) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Handle drag end - swipe detection
  const handleDragEnd = (event: any, info: any) => {
    const threshold = 100; // Minimum distance to trigger swipe
    
    if (Math.abs(info.offset.x) > threshold || Math.abs(info.offset.y) > threshold) {
      onSwipe();
    }
    
    // Reset position with spring animation
    dragX.set(0);
    dragY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{
        position: 'absolute',
        width: '100%',
        maxWidth: `${cardDimensions.width}px`,
        height: `${cardDimensions.height}px`,
        maxHeight: '100%',
        zIndex,
        scale,
        rotateZ: isTop ? (isDragging ? dragRotateZ : rotateZ) : rotation,
        x: isTop ? dragX : 0,
        y: isTop ? combinedY : yOffset,
        touchAction: 'none', // Prevent default touch behaviors
      } as React.CSSProperties}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      drag={isTop}
      dragDirectionLock={false}
      dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
      dragElastic={0.3}
      dragMomentum={false}
      onDragStart={() => {
        if (isTop) setIsDragging(true);
      }}
      onDrag={(_, info) => {
        if (isTop) {
          dragX.set(info.offset.x);
          dragY.set(info.offset.y);
        }
      }}
      onDragEnd={(event, info) => {
        if (isTop) setIsDragging(false);
        handleDragEnd(event, info);
      }}
      whileHover={isTop ? { scale: 1.02 } : {}}
      whileTap={isTop ? { scale: 0.98 } : {}}
      whileDrag={isTop ? { scale: 1.05, zIndex: 1000 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="cursor-grab active:cursor-grabbing"
    >
      <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 bg-gray-200">
        <img
          src={card.img}
          alt={`Property image ${card.id}`}
          className="w-full h-full object-cover select-none"
          draggable={false}
          loading={index === 0 ? 'eager' : 'lazy'}
          onError={(e) => {
            // Fallback to placeholder on error
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-property.jpg';
          }}
        />
      </div>
    </motion.div>
  );
};

export default Stack;

