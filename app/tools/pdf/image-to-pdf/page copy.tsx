"use client";

export default function ImageToPDF() {
  async function handleSubmit(e: any) {
    e.preventDefault();
    const form = new FormData(e.target);

    const res = await fetch("/api/pdf/image-to-pdf", {
      method: "POST",
      body: form,
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "images.pdf";
    a.click();
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Image to PDF</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          name="files"
          accept="image/*"
          multiple
          required
        />
        <br /><br />
        <button type="submit">Convert to PDF</button>
      </form>
    </main>
  );
}
