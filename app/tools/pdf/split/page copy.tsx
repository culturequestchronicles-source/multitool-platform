"use client";

export default function SplitPDF() {
  async function handleSubmit(e: any) {
    e.preventDefault();
    const form = new FormData(e.target);

    await fetch("/api/pdf/split", {
      method: "POST",
      body: form,
    });

    alert("PDF split successfully (check backend logic)");
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Split PDF</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          name="file"
          accept="application/pdf"
          required
        />
        <br /><br />
        <button type="submit">Split PDF</button>
      </form>
    </main>
  );
}
