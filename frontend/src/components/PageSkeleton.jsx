// frontend/src/components/PageSkeleton.jsx
const shimmerKeyframes = `
@keyframes skeleton-shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
}
`;

const shimmerBg =
  'linear-gradient(90deg, #e8e0d5 25%, #f0e8dc 50%, #e8e0d5 75%)';

const blockStyle = {
  background: shimmerBg,
  backgroundSize: '1200px 100%',
  animation: 'skeleton-shimmer 1.4s infinite linear',
  borderRadius: 8,
};

const blocks = [
  { width: '70%',  height: 22, marginBottom: 12 },
  { width: '90%',  height: 14, marginBottom: 8  },
  { width: '55%',  height: 14, marginBottom: 32 },
  { width: '100%', height: 140, marginBottom: 24 },
  { width: '80%',  height: 14, marginBottom: 8  },
  { width: '65%',  height: 14, marginBottom: 0  },
];

export default function PageSkeleton() {
  return (
    <>
      {/* Inject keyframe animation once */}
      <style>{shimmerKeyframes}</style>

      <div
        style={{
          minHeight: '100vh',
          background: '#FAF7F2',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Fake navbar */}
        <div
          style={{
            height: 64,
            background: '#2D5016',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            boxSizing: 'border-box',
          }}
        >
          {/* Logo placeholder */}
          <div
            style={{
              ...blockStyle,
              width: 120,
              height: 20,
              borderRadius: 6,
              opacity: 0.35,
            }}
          />
        </div>

        {/* Content area */}
        <div
          style={{
            maxWidth: 760,
            margin: '40px auto',
            padding: '0 24px',
          }}
        >
          {blocks.map((b, i) => (
            <div
              key={i}
              style={{
                ...blockStyle,
                width: b.width,
                height: b.height,
                marginBottom: b.marginBottom,
              }}
            />
          ))}

          {/* Second group of blocks */}
          <div style={{ marginTop: 16 }}>
            {[
              { width: '85%',  height: 14, marginBottom: 8  },
              { width: '60%',  height: 14, marginBottom: 8  },
              { width: '100%', height: 100, marginBottom: 0  },
            ].map((b, i) => (
              <div
                key={i}
                style={{
                  ...blockStyle,
                  width: b.width,
                  height: b.height,
                  marginBottom: b.marginBottom,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
