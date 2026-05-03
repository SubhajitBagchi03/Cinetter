/**
 * Rolling Text Marquee — Component 6
 * Usage: <RollingText items={['a','b','c']} speed={35} accent />
 */
export default function RollingText({ items = [], speed = 35, accent = false, gap = 48 }) {
  const doubled = [...items, ...items];
  return (
    <div
      className="marquee"
      style={{
        borderTop: '1px solid #1E1E1E',
        borderBottom: '1px solid #1E1E1E',
        height: 44,
        display: 'flex',
        alignItems: 'center',
        background: accent ? '#FF4D00' : 'transparent',
      }}
    >
      <div
        className="marquee__track"
        style={{ animationDuration: `${speed}s` }}
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: `0 ${gap}px`,
              fontFamily: "Google Sans Flex",
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: accent ? '#000' : '#555',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: accent ? '#000' : '#333',
                flexShrink: 0,
              }}
            />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
