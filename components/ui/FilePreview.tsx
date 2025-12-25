export default function FilePreview({ file }: { file: File | null }) {
    if (!file) return null;
  
    return (
      <div
        style={{
          border: "1px dashed #c7d2fe",
          padding: 12,
          borderRadius: 8,
          marginTop: 12,
          fontSize: 14,
        }}
      >
        <strong>Selected File</strong>
        <div>Name: {file.name}</div>
        <div>Size: {(file.size / 1024).toFixed(2)} KB</div>
        <div>Type: {file.type || "Unknown"}</div>
      </div>
    );
  }
  