export default function ProgressBar({ progress }: { progress: number }) {
    return (
      <div
        style={{
          width: "100%",
          height: 8,
          background: "#e5e7eb",
          borderRadius: 6,
          overflow: "hidden",
          marginTop: 12,
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "#2563eb",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    );
  }
  