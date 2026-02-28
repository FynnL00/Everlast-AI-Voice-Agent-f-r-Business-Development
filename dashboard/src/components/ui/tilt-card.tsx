import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    maxRotation?: number;  // degrees (default: 3)
    speed?: number;        // transition ms (default: 400)
}

export function TiltCard({ children, className, maxRotation = 3, speed = 400, ...props }: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const rectRef = useRef<DOMRect | null>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = rectRef.current;
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateY = ((x - centerX) / centerX) * maxRotation;
        const rotateX = ((centerY - y) / centerY) * maxRotation;
        setRotation({ x: rotateX, y: rotateY });
    };

    return (
        <div
            ref={ref}
            className={cn("perspective-1000 transform-style-3d will-change-transform", className)}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => {
                if (ref.current) rectRef.current = ref.current.getBoundingClientRect();
                setIsHovered(true);
            }}
            onMouseLeave={() => {
                setIsHovered(false);
                setRotation({ x: 0, y: 0 });
                rectRef.current = null;
            }}
            {...props}
        >
            <div
                className={cn(
                    "w-full h-full transition-transform ease-out",
                    isHovered ? "duration-100" : `duration-${speed}`
                )}
                style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
            >
                {children}
            </div>
        </div>
    );
}
