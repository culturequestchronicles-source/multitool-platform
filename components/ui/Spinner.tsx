export default function Spinner() {
    return (
      <div
        style={{
          width: 32,
          height: 32,
          border: "4px solid #e5e7eb",
          borderTop: "4px solid #2563eb",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
    );
  }
  