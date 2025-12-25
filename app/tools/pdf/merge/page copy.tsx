"use client";

export default function MergePDF() {
  async function handleSubmit(e: any) {
    e.preventDefault();
    const form = new FormData(e.target);

    const res = await fetch("/api/pdf/merge", {
      method: "POST",
      body: form,
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "merged.pdf";
    a.click();
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Merge PDF</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          name="files"
          multiple
          accept="application/pdf"
          required
        />
        <br /><br />
        <button type="submit">Merge PDFs</button>
      </form>
    </main>
  );
}
