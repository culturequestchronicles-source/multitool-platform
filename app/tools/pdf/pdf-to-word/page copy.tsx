"use client";

export default function PDFToWord() {
  async function handleSubmit(e: any) {
    e.preventDefault();
    const form = new FormData(e.target);

    const res = await fetch("/api/pdf/pdf-to-word", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    const blob = new Blob([data.text], { type: "text/plain" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.txt";
    a.click();
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>PDF to Word</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          name="file"
          accept="application/pdf"
          required
        />
        <br /><br />
        <button type="submit">Convert to Word</button>
      </form>
    </main>
  );
}
