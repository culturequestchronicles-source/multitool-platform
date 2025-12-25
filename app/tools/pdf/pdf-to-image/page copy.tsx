"use client";

export default function PDFToImage() {
  async function handleSubmit(e: any) {
    e.preventDefault();
    const form = new FormData(e.target);

    await fetch("/api/pdf/pdf-to-image", {
      method: "POST",
      body: form,
    });

    alert("PDF pages ready for image conversion");
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>PDF to Image</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          name="file"
          accept="application/pdf"
          required
        />
        <br /><br />
        <button type="submit">Convert to Images</button>
      </form>
    </main>
  );
}
