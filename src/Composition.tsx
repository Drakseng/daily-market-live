import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import rawData from './data/marketData.json';

// ─── Types ────────────────────────────────────────────────────────────────────
type MarketData = typeof rawData;
const data = rawData as MarketData;

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#0a0f1e',
  surface: '#0d1428',
  border: '#1a2744',
  green: '#00d4aa',
  red: '#ff4757',
  gold: '#f7b731',
  blue: '#3b82f6',
  white: '#e8edf5',
  muted: '#4b5a72',
  mutedLight: '#8892a4',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function trPrice(n: number): string {
  const [int, dec] = n.toFixed(2).split('.');
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`;
}

function ease(
  frame: number,
  from: number,
  to: number,
): number {
  return interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
}

function fadeIn(frame: number, start = 0, dur = 15): number {
  return interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

// ─── Brand header (shared across all scenes) ──────────────────────────────────
const Header = ({ date }: { date: string }) => (
  <div
    style={{
      position: 'absolute',
      top: 28,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 52px',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          width: 5,
          height: 42,
          background: `linear-gradient(180deg, #60a5fa 0%, ${C.blue} 100%)`,
          borderRadius: 3,
        }}
      />
      <div>
        <div
          style={{
            color: C.blue,
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: 4,
            fontFamily: 'monospace',
          }}
        >
          MATRIKS AI
        </div>
        <div
          style={{
            color: C.muted,
            fontSize: 11,
            fontFamily: 'sans-serif',
            letterSpacing: 1.5,
            marginTop: 1,
          }}
        >
          Günlük Piyasa Özeti
        </div>
      </div>
    </div>
    <div
      style={{
        color: C.mutedLight,
        fontSize: 14,
        fontFamily: 'sans-serif',
        fontWeight: 500,
        letterSpacing: 0.5,
      }}
    >
      {date}
    </div>
  </div>
);

// ─── Subtle grid overlay ──────────────────────────────────────────────────────
const GridBg = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: [
        'linear-gradient(rgba(59,130,246,0.035) 1px, transparent 1px)',
        'linear-gradient(90deg, rgba(59,130,246,0.035) 1px, transparent 1px)',
      ].join(','),
      backgroundSize: '64px 64px',
    }}
  />
);

// ─── Divider line ─────────────────────────────────────────────────────────────
const Divider = ({ top }: { top: number }) => (
  <div
    style={{
      position: 'absolute',
      top,
      left: 52,
      right: 52,
      height: 1,
      background: C.border,
    }}
  />
);

// ─── Scene 1 — BIST 100 overview (0-8 s, 240 frames) ─────────────────────────
const Scene1 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOpacity = fadeIn(frame, 0, 20);

  // Animated price counter: 0.3 s → 5 s
  const priceP = ease(frame, fps * 0.3, fps * 5);
  const animatedPrice = data.bist100.price * priceP;

  // Change badge fades in at 2 s
  const changeFade = fadeIn(frame, fps * 2, fps * 0.4);

  // Breadth bar grows: 3 s → 6.5 s
  const barP = ease(frame, fps * 3, fps * 6.5);

  // Breadth labels fade after bar
  const breadthFade = fadeIn(frame, fps * 3.5, fps * 0.5);

  const isPos = data.bist100.changePercent >= 0;
  const priceColor = isPos ? C.green : C.red;

  const total = data.breadth.gainers + data.breadth.losers;
  const gRatio = data.breadth.gainers / total;
  const lRatio = data.breadth.losers / total;

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOpacity }}>
      <GridBg />
      <Header date={data.date} />
      <Divider top={88} />

      {/* Centre block */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -52%)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            color: C.muted,
            fontSize: 16,
            fontFamily: 'sans-serif',
            letterSpacing: 8,
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          B I S T  1 0 0
        </div>

        {/* Price */}
        <div
          style={{
            color: C.white,
            fontSize: 98,
            fontFamily: 'monospace',
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: -2,
            textShadow: `0 0 60px ${priceColor}2a`,
          }}
        >
          {trPrice(animatedPrice)}
        </div>

        {/* Change percent badge */}
        <div
          style={{
            marginTop: 18,
            display: 'inline-block',
            opacity: changeFade,
            transform: `translateY(${interpolate(changeFade, [0, 1], [12, 0])}px)`,
            background: `${priceColor}18`,
            border: `1.5px solid ${priceColor}50`,
            borderRadius: 40,
            padding: '8px 28px',
          }}
        >
          <span
            style={{
              color: priceColor,
              fontSize: 34,
              fontFamily: 'sans-serif',
              fontWeight: 800,
            }}
          >
            {isPos ? '▲' : '▼'} %{Math.abs(data.bist100.changePercent).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Market Breadth */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 80,
          right: 80,
        }}
      >
        <div
          style={{
            color: C.muted,
            fontSize: 11,
            fontFamily: 'sans-serif',
            letterSpacing: 3,
            textAlign: 'center',
            marginBottom: 14,
            fontWeight: 700,
          }}
        >
          P İ Y A S A  G E N İ Ş L İ Ğ İ
        </div>

        {/* Bar track */}
        <div
          style={{
            height: 10,
            borderRadius: 5,
            background: C.border,
            display: 'flex',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${gRatio * barP * 100}%`,
              background: C.green,
              borderRadius: '5px 0 0 5px',
            }}
          />
          <div
            style={{
              width: `${lRatio * barP * 100}%`,
              background: C.red,
              borderRadius: '0 5px 5px 0',
            }}
          />
        </div>

        {/* Labels */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 12,
            opacity: breadthFade,
          }}
        >
          <div style={{ color: C.green, fontSize: 17, fontWeight: 700, fontFamily: 'sans-serif' }}>
            ▲ {data.breadth.gainers} Yükselen
          </div>
          <div style={{ color: C.mutedLight, fontSize: 13, fontFamily: 'sans-serif' }}>
            Top Hacim: {data.totalVolume}
          </div>
          <div style={{ color: C.red, fontSize: 17, fontWeight: 700, fontFamily: 'sans-serif' }}>
            {data.breadth.losers} Düşen ▼
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Generic stock row (used by scenes 2, 3, 4) ───────────────────────────────
const StockRow = ({
  symbol,
  value,
  index,
  fromRight,
  color,
}: {
  symbol: string;
  value: string;
  index: number;
  fromRight: boolean;
  color: string;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = index * Math.round(fps / 5); // 6-frame stagger @30fps
  const p = ease(frame, delay, delay + fps * 0.55);

  const tx = interpolate(p, [0, 1], [fromRight ? 300 : -300, 0]);
  const opacity = interpolate(p, [0, 0.35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        transform: `translateX(${tx}px)`,
        opacity,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '17px 28px',
        marginBottom: 10,
        background: `${color}0f`,
        border: `1px solid ${color}28`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div
          style={{
            color: C.muted,
            fontSize: 15,
            fontFamily: 'monospace',
            fontWeight: 600,
            minWidth: 26,
          }}
        >
          #{index + 1}
        </div>
        <div
          style={{
            color: C.white,
            fontSize: 26,
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: 1.5,
          }}
        >
          {symbol}
        </div>
      </div>
      <div
        style={{
          color,
          fontSize: 30,
          fontFamily: 'monospace',
          fontWeight: 800,
        }}
      >
        {value}
      </div>
    </div>
  );
};

// ─── Scene header (title + underline) ────────────────────────────────────────
const SceneTitle = ({ label, color }: { label: string; color: string }) => (
  <div
    style={{
      position: 'absolute',
      top: 108,
      left: 0,
      right: 0,
      textAlign: 'center',
    }}
  >
    <div
      style={{
        color,
        fontSize: 21,
        fontFamily: 'sans-serif',
        fontWeight: 800,
        letterSpacing: 5,
      }}
    >
      {label}
    </div>
    <div
      style={{
        width: 56,
        height: 3,
        background: color,
        borderRadius: 2,
        margin: '10px auto 0',
      }}
    />
  </div>
);

// ─── Scene 2 — Top gainers (8-18 s, 300 frames) ───────────────────────────────
const Scene2 = () => {
  const frame = useCurrentFrame();
  const sceneOpacity = fadeIn(frame, 0, 18);

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOpacity }}>
      <GridBg />
      <Header date={data.date} />
      <Divider top={88} />
      <SceneTitle label="EN ÇOK YÜKSELENLER" color={C.green} />

      <div style={{ position: 'absolute', top: 178, left: 80, right: 80 }}>
        {data.gainers.slice(0, 5).map((g, i) => (
          <StockRow
            key={g.symbol}
            symbol={g.symbol}
            value={`+${g.change.toFixed(2)} TL`}
            index={i}
            fromRight
            color={C.green}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3 — Top losers (18-26 s, 240 frames) ───────────────────────────────
const Scene3 = () => {
  const frame = useCurrentFrame();
  const sceneOpacity = fadeIn(frame, 0, 18);

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOpacity }}>
      <GridBg />
      <Header date={data.date} />
      <Divider top={88} />
      <SceneTitle label="EN ÇOK DÜŞENLER" color={C.red} />

      <div style={{ position: 'absolute', top: 178, left: 80, right: 80 }}>
        {data.losers.slice(0, 5).map((l, i) => (
          <StockRow
            key={l.symbol}
            symbol={l.symbol}
            value={`${l.change.toFixed(2)} TL`}
            index={i}
            fromRight={false}
            color={C.red}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4 — Volume leaders + outro (26-30 s, 120 frames) ──────────────────
const Scene4 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOpacity = fadeIn(frame, 0, 18);

  const outroP = ease(frame, fps * 2.4, fps * 3.6);
  const outroOpacity = interpolate(outroP, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const outroY = interpolate(outroP, [0, 1], [18, 0]);

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOpacity }}>
      <GridBg />
      <Header date={data.date} />
      <Divider top={88} />
      <SceneTitle label="HACİM LİDERLERİ" color={C.gold} />

      <div style={{ position: 'absolute', top: 178, left: 80, right: 80 }}>
        {data.volumeLeaders.slice(0, 3).map((v, i) => (
          <StockRow
            key={v.symbol}
            symbol={v.symbol}
            value={v.volume}
            index={i}
            fromRight
            color={C.gold}
          />
        ))}
      </div>

      {/* Outro */}
      <div
        style={{
          position: 'absolute',
          bottom: 46,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: outroOpacity,
          transform: `translateY(${outroY}px)`,
        }}
      >
        <div
          style={{
            width: 180,
            height: 1,
            background: C.border,
            margin: '0 auto 14px',
          }}
        />
        <div
          style={{
            color: C.muted,
            fontSize: 13,
            fontFamily: 'sans-serif',
            letterSpacing: 2,
          }}
        >
          Powered by{' '}
          <span style={{ color: C.blue, fontWeight: 700 }}>MATRIKS AI</span>
          {' '}• matriks.ai
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Root composition ─────────────────────────────────────────────────────────
export const BistMarketSummary = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Scene 1: 0 – 8 s */}
      <Sequence from={0} durationInFrames={8 * fps} premountFor={fps}>
        <Scene1 />
      </Sequence>

      {/* Scene 2: 8 – 18 s */}
      <Sequence from={8 * fps} durationInFrames={10 * fps} premountFor={fps}>
        <Scene2 />
      </Sequence>

      {/* Scene 3: 18 – 26 s */}
      <Sequence from={18 * fps} durationInFrames={8 * fps} premountFor={fps}>
        <Scene3 />
      </Sequence>

      {/* Scene 4: 26 – 30 s */}
      <Sequence from={26 * fps} durationInFrames={4 * fps} premountFor={fps}>
        <Scene4 />
      </Sequence>
    </AbsoluteFill>
  );
};
