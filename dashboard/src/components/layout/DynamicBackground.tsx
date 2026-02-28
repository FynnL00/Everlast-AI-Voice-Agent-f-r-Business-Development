export function DynamicBackground() {
    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            {/* Orb 1 - top-left, blue-purple, largest */}
            <div
                className="ambient-orb absolute -top-[20%] -left-[10%] h-[60vh] w-[60vh] rounded-full"
                style={{
                    background: "radial-gradient(circle, var(--ambient-orb-1) 0%, transparent 70%)",
                    filter: "blur(80px)",
                    animation: "ambient-drift-1 22s ease-in-out infinite",
                    willChange: "transform",
                }}
            />
            {/* Orb 2 - top-right, violet */}
            <div
                className="ambient-orb absolute -top-[10%] -right-[15%] h-[50vh] w-[50vh] rounded-full"
                style={{
                    background: "radial-gradient(circle, var(--ambient-orb-2) 0%, transparent 70%)",
                    filter: "blur(90px)",
                    animation: "ambient-drift-2 26s ease-in-out infinite",
                    willChange: "transform",
                }}
            />
            {/* Orb 3 - bottom-left, teal-blue */}
            <div
                className="ambient-orb absolute -bottom-[15%] -left-[10%] h-[55vh] w-[55vh] rounded-full"
                style={{
                    background: "radial-gradient(circle, var(--ambient-orb-3) 0%, transparent 70%)",
                    filter: "blur(100px)",
                    animation: "ambient-drift-3 30s ease-in-out infinite",
                    willChange: "transform",
                }}
            />
            {/* Orb 4 - bottom-right, green accent */}
            <div
                className="ambient-orb absolute -bottom-[20%] -right-[5%] h-[45vh] w-[45vh] rounded-full"
                style={{
                    background: "radial-gradient(circle, var(--ambient-orb-4) 0%, transparent 70%)",
                    filter: "blur(70px)",
                    animation: "ambient-drift-4 34s ease-in-out infinite",
                    willChange: "transform",
                }}
            />
        </div>
    );
}
