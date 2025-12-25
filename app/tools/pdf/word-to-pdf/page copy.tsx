"use client";

export default function WordToPDF() {
  async function handleSubmit(e: any) {
    e.preventDefault();
    const form = new FormData(e.target);

    const res = await fetch("/api/pdf/word-to-pdf", {
      method: "POST",
      body: form,
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "document.pdf";
    a.click();
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Word to PDF</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          name="file"
          accept=".doc,.docx"
          required
        />
        <br /><br />
        <button type="submit">Convert to PDF</button>
      </form>
    </main>
  );
}
