// components/dashboard/Custom3DBar.tsx
import { useEffect, useRef, useCallback } from "react";

function colorToId(color: string): string {
    return color.replace(/[^a-zA-Z0-9]/g, "");
}

const PRESET_GRADIENTS: Record<string, { side: [string, string]; top: [string, string] }> = {
    "var(--score-good)": { side: ["#047857", "#6ee7b7"], top: ["#34d399", "#10b981"] },
    "var(--score-warning)": { side: ["#ca8a04", "#fde047"], top: ["#facc15", "#eab308"] },
    "var(--score-danger)": { side: ["#b91c1c", "#fca5a5"], top: ["#f87171", "#ef4444"] },
    "var(--primary)": { side: ["hsl(var(--primary))", "hsl(var(--primary))"], top: ["hsl(var(--primary))", "hsl(var(--primary))"] },
};

function getCorner(baseAngle: number, offsetDeg: number, radius: number, centerX: number, centerY: number) {
    const rad = ((baseAngle + offsetDeg) * Math.PI) / 180;
    return {
        x: centerX + radius * Math.cos(rad),
        y: centerY + radius * Math.sin(rad) * 0.5, // 0.5 = isometric perspective squash
    };
}

function buildFacePath(
    angle: number, faceIdx: number, nextIdx: number, radius: number,
    cx: number, cyTop: number, cyBottom: number,
): string {
    const c1 = getCorner(angle, faceIdx * 90, radius, cx, cyTop);
    const c2 = getCorner(angle, nextIdx * 90, radius, cx, cyTop);
    const c3 = getCorner(angle, nextIdx * 90, radius, cx, cyBottom);
    const c4 = getCorner(angle, faceIdx * 90, radius, cx, cyBottom);
    return `M ${c1.x},${c1.y} L ${c2.x},${c2.y} L ${c3.x},${c3.y} L ${c4.x},${c4.y} Z`;
}

function buildTopPath(angle: number, radius: number, cx: number, cyTop: number): string {
    const c0 = getCorner(angle, 0, radius, cx, cyTop);
    const c1 = getCorner(angle, 90, radius, cx, cyTop);
    const c2 = getCorner(angle, 180, radius, cx, cyTop);
    const c3 = getCorner(angle, 270, radius, cx, cyTop);
    return `M ${c0.x},${c0.y} L ${c1.x},${c1.y} L ${c2.x},${c2.y} L ${c3.x},${c3.y} Z`;
}

export const Custom3DBar = (props: any) => {
    const { fill, x, y, width, height } = props;

    const faceRefs = useRef<(SVGPathElement | null)[]>([null, null, null, null]);
    const topRef = useRef<SVGPathElement | null>(null);
    const rafRef = useRef<number>(0);
    const propsRef = useRef({ x, y, width, height });
    propsRef.current = { x, y, width, height };

    const setFaceRef = useCallback((index: number) => (el: SVGPathElement | null) => {
        faceRefs.current[index] = el;
    }, []);

    useEffect(() => {
        const animate = () => {
            const { x: px, y: py, width: pw, height: ph } = propsRef.current;
            if (!ph || ph === 0) { rafRef.current = requestAnimationFrame(animate); return; }

            const angle = (Date.now() * 0.03) % 360; // rotation speed
            const barSize = pw * 0.7;
            const radius = barSize / 2;
            const cx = px + pw / 2;
            const cyTop = py;
            const cyBottom = py + ph;

            const faceData: { index: number; z: number; next: number }[] = [];
            for (let i = 0; i < 4; i++) {
                const next = (i + 1) % 4;
                const midAngle = angle + 45 + i * 90;
                const z = Math.sin((midAngle * Math.PI) / 180);
                faceData.push({ index: i, z, next });
            }
            faceData.sort((a, b) => a.z - b.z); // painter's algorithm

            for (let sortIdx = 0; sortIdx < 4; sortIdx++) {
                const f = faceData[sortIdx];
                const el = faceRefs.current[sortIdx];
                if (!el) continue;
                if (f.z < -0.15) { el.style.display = "none"; continue; } // face culling
                el.style.display = "";
                el.setAttribute("d", buildFacePath(angle, f.index, f.next, radius, cx, cyTop, cyBottom));
                el.style.filter = `brightness(${0.8 + Math.max(0, f.z) * 0.4})`;
            }

            if (topRef.current) {
                topRef.current.setAttribute("d", buildTopPath(angle, radius, cx, cyTop));
            }
            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    if (!height || height === 0) return null;

    const cid = colorToId(fill || "default");
    const gradientIdSide = `bar3d-side-${cid}`;
    const gradientIdTop = `bar3d-top-${cid}`;
    const preset = PRESET_GRADIENTS[fill];
    const initAngle = (Date.now() * 0.03) % 360;
    const barSize = width * 0.7;
    const radius = barSize / 2;
    const cx = x + width / 2;

    return (
        <g>
            {/* Invisible hit area — prevents tooltip jitter */}
            <rect x={x} y={y} width={width} height={height} fill="transparent" pointerEvents="all" />
            <defs>
                <linearGradient id={gradientIdSide} x1="0" y1="0" x2="0" y2="1">
                    {preset ? (
                        <>
                            <stop offset="0%" stopColor={preset.side[0]} />
                            <stop offset="100%" stopColor={preset.side[1]} />
                        </>
                    ) : (
                        <>
                            <stop offset="0%" style={{ stopColor: `color-mix(in srgb, ${fill} 80%, white)` }} />
                            <stop offset="100%" style={{ stopColor: `color-mix(in srgb, ${fill} 55%, white)` }} />
                        </>
                    )}
                </linearGradient>
                <linearGradient id={gradientIdTop} x1="0" y1="0" x2="0" y2="1">
                    {preset ? (
                        <>
                            <stop offset="0%" stopColor={preset.top[0]} />
                            <stop offset="100%" stopColor={preset.top[1]} />
                        </>
                    ) : (
                        <>
                            <stop offset="0%" style={{ stopColor: `color-mix(in srgb, ${fill} 70%, white)` }} />
                            <stop offset="100%" style={{ stopColor: `color-mix(in srgb, ${fill} 70%, white)` }} />
                        </>
                    )}
                </linearGradient>
            </defs>

            {[0, 1, 2, 3].map(sortIdx => (
                <path
                    key={sortIdx}
                    ref={setFaceRef(sortIdx)}
                    d={buildFacePath(initAngle, sortIdx, (sortIdx + 1) % 4, radius, cx, y, y + height)}
                    fill={`url(#${gradientIdSide})`}
                    style={{ transition: 'none', pointerEvents: 'none' }}
                    stroke="none"
                />
            ))}

            <path
                ref={topRef}
                d={buildTopPath(initAngle, radius, cx, y)}
                fill={`url(#${gradientIdTop})`}
                style={{ filter: 'brightness(1.1)', pointerEvents: 'none' }}
            />
        </g>
    );
};
