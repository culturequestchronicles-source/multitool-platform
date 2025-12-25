"use client";

export default function CompressPDF() {
  async function handleSubmit(e: any) {
    e.preventDefault();
    const form = new FormData(e.target);

    const res = await fetch("/api/pdf/compress", {
      method: "POST",
      body: form,
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "compressed.pdf";
    a.click();
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Compress PDF</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          name="file"
          accept="application/pdf"
          required
        />
        <br /><br />
        <button type="submit">Compress PDF</button>
      </form>
    </main>
  );
}
