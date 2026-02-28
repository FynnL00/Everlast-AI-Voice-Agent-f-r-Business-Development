import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
    value: number;
    suffix?: string;    // default: "%"
    duration?: number;  // default: 600ms
    className?: string;
}

export function AnimatedNumber({ value, suffix = "%", duration = 600, className }: AnimatedNumberProps) {
    const [displayed, setDisplayed] = useState(0);
    const rafRef = useRef<number>(0);
    const startRef = useRef<number | null>(null);
    const fromRef = useRef(0);

    useEffect(() => {
        fromRef.current = displayed;
        startRef.current = null;

        function animate(timestamp: number) {
            if (startRef.current === null) startRef.current = timestamp;
            const elapsed = timestamp - startRef.current;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const current = Math.round(fromRef.current + (value - fromRef.current) * eased);
            setDisplayed(current);
            if (progress < 1) rafRef.current = requestAnimationFrame(animate);
        }

        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [value, duration]);

    return <span className={className}>{displayed}{suffix}</span>;
}
