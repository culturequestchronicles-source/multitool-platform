import type { FaqItem } from "@/lib/seo/schema";
import { absUrl } from "@/lib/seo/site";

export type RelatedLink = { href: string; label: string };

export type ToolSeoConfig = {
  path: string;
  title: string;
  description: string;
  keywords: string[];
  applicationCategory?: string;
  /**
   * If false, we still allow metadata/schema usage, but exclude from sitemap
   * and recommend setting robots noindex on that route.
   */
  indexable?: boolean;
  what: string[];
  howTo: string[];
  notes?: string[];
  faqs: FaqItem[];
  related: RelatedLink[];
};

const PDF_RELATED: RelatedLink[] = [
  { href: "/tools/pdf/merge", label: "Merge PDF" },
  { href: "/tools/pdf/split", label: "Split PDF" },
  { href: "/tools/pdf/compress", label: "Compress PDF" },
  { href: "/tools/pdf/pdf-to-word", label: "PDF to Word" },
  { href: "/tools/pdf/word-to-pdf", label: "Word to PDF" },
  { href: "/tools/pdf/image-to-pdf", label: "Image to PDF" },
  { href: "/tools/pdf/pdf-to-image", label: "PDF to Image" },
];

export const TOOL_SEO: Record<string, ToolSeoConfig> = {
  "/tools/pdf/merge": {
    path: "/tools/pdf/merge",
    title: "Merge PDF Online — Free Tool | Jhatpat",
    description: "Merge multiple PDF files into one. Simple upload, fast processing, download instantly.",
    keywords: ["merge pdf", "combine pdf", "pdf merger", "merge pdf online", "jhatpat"],
    applicationCategory: "UtilitiesApplication",
    what: [
      "Combine multiple PDFs into a single PDF in the order you choose.",
      "Works in your browser with a simple upload → merge → download flow.",
    ],
    howTo: ["Select two or more PDF files.", "Click Merge.", "Download the merged PDF."],
    notes: ["Processing happens via the Jhatpat server API; avoid uploading sensitive documents."],
    faqs: [
      { question: "Is Merge PDF free?", answer: "Yes. You can merge PDFs without creating an account." },
      { question: "Is there a file size limit?", answer: "Large PDFs may fail to upload or process depending on your device and network." },
      { question: "Will my PDF be stored?", answer: "This tool processes your upload to produce an output file. Avoid uploading confidential documents." },
    ],
    related: PDF_RELATED,
  },
  "/tools/pdf/split": {
    path: "/tools/pdf/split",
    title: "Split PDF Online — Extract Pages | Jhatpat",
    description: "Split a PDF into separate page PDFs. Upload once and download the pages instantly.",
    keywords: ["split pdf", "extract pdf pages", "pdf splitter", "split pdf online", "jhatpat"],
    applicationCategory: "UtilitiesApplication",
    what: ["Split every page of a PDF into individual PDF files.", "Downloads each page as a separate PDF."],
    howTo: ["Select a PDF file.", "Click Split & Download.", "Your browser downloads each page PDF."],
    notes: ["Processing happens via the Jhatpat server API; avoid uploading sensitive documents."],
    faqs: [
      { question: "Can I split only a page range?", answer: "Currently this tool splits all pages into separate PDFs." },
      { question: "Why do I get many downloads?", answer: "Each page is returned as an individual PDF file." },
      { question: "Does it work on large PDFs?", answer: "Very large PDFs may take longer or fail depending on size and complexity." },
    ],
    related: PDF_RELATED,
  },
  "/tools/pdf/compress": {
    path: "/tools/pdf/compress",
    title: "Compress PDF Online — Reduce Size | Jhatpat",
    description: "Compress a PDF to reduce file size. Upload your PDF and download a smaller version.",
    keywords: ["compress pdf", "reduce pdf size", "pdf compressor", "compress pdf online", "jhatpat"],
    applicationCategory: "UtilitiesApplication",
    what: ["Reduce PDF file size using a basic safe compression pipeline.", "Download the compressed PDF immediately."],
    howTo: ["Select a PDF file.", "Click Compress & Download.", "Download the compressed PDF."],
    notes: ["Processing happens via the Jhatpat server API; avoid uploading sensitive documents."],
    faqs: [
      { question: "Will compression change quality?", answer: "Compression can reduce size but may also reduce quality depending on the PDF content." },
      { question: "Why is my PDF not getting smaller?", answer: "Some PDFs are already optimized; results depend on images/fonts inside the file." },
      { question: "Is this tool free?", answer: "Yes, it’s free to use." },
    ],
    related: PDF_RELATED,
  },
  "/tools/pdf/pdf-to-word": {
    path: "/tools/pdf/pdf-to-word",
    title: "PDF to Word Converter — DOCX | Jhatpat",
    description: "Convert a PDF into a Word (DOCX) file. Upload a PDF and download an editable document.",
    keywords: ["pdf to word", "pdf to docx", "convert pdf to word", "jhatpat"],
    applicationCategory: "UtilitiesApplication",
    what: ["Convert PDFs into Word (DOCX) format.", "Designed for quick conversions and downloading."],
    howTo: ["Upload a PDF.", "Click Convert to Word.", "Download the DOCX output."],
    notes: ["Processing happens via the Jhatpat server API; avoid uploading sensitive documents."],
    faqs: [
      { question: "Will formatting be perfect?", answer: "Results vary by PDF complexity; scanned PDFs may not convert cleanly." },
      { question: "Does it support scanned PDFs?", answer: "This converter extracts text; it is not an OCR tool." },
      { question: "Is my file uploaded?", answer: "Yes, conversion runs via the server API. Avoid sensitive documents." },
    ],
    related: PDF_RELATED,
  },
  "/tools/pdf/word-to-pdf": {
    path: "/tools/pdf/word-to-pdf",
    title: "Word to PDF Converter — DOCX to PDF | Jhatpat",
    description: "Convert DOCX to PDF quickly. Upload a Word file and download a PDF.",
    keywords: ["word to pdf", "docx to pdf", "convert word to pdf", "jhatpat"],
    applicationCategory: "UtilitiesApplication",
    what: ["Convert Word (DOCX) files into PDF format.", "Download the resulting PDF immediately."],
    howTo: ["Upload a DOCX file.", "Click Convert to PDF.", "Download the PDF output."],
    notes: ["Processing happens via the Jhatpat server API; avoid uploading sensitive documents."],
    faqs: [
      { question: "What file types are supported?", answer: "This tool accepts DOCX files." },
      { question: "Will fonts/layout match exactly?", answer: "Output may vary depending on the input document’s formatting." },
      { question: "Is it free?", answer: "Yes, it’s free to use." },
    ],
    related: PDF_RELATED,
  },
  "/tools/pdf/image-to-pdf": {
    path: "/tools/pdf/image-to-pdf",
    title: "Image to PDF — JPG/PNG to PDF | Jhatpat",
    description: "Convert images (JPG/PNG) into a single PDF. Upload one or more images and download a PDF.",
    keywords: ["image to pdf", "jpg to pdf", "png to pdf", "convert image to pdf", "jhatpat"],
    applicationCategory: "UtilitiesApplication",
    what: ["Combine multiple images into one PDF.", "Supports common formats like JPG and PNG."],
    howTo: ["Select one or more images.", "Click Convert to PDF.", "Download the PDF file."],
    notes: ["Processing happens via the Jhatpat server API; avoid uploading sensitive images."],
    faqs: [
      { question: "Can I upload multiple images?", answer: "Yes, you can select multiple images and combine them into one PDF." },
      { question: "Can I reorder pages?", answer: "Currently the output follows the upload order." },
      { question: "Is it free?", answer: "Yes, it’s free to use." },
    ],
    related: PDF_RELATED,
  },
  "/tools/pdf/pdf-to-image": {
    path: "/tools/pdf/pdf-to-image",
    title: "PDF to Image — Convert PDF Pages to PNG | Jhatpat",
    description: "Convert each PDF page to PNG images and download as a ZIP. Includes progress and previews.",
    keywords: ["pdf to png", "pdf to image", "convert pdf pages", "jhatpat"],
    applicationCategory: "UtilitiesApplication",
    what: ["Turns each PDF page into a PNG image.", "Shows progress and previews, then lets you download a ZIP."],
    howTo: ["Upload a PDF.", "Click Convert to PNG.", "When done, download the ZIP."],
    notes: ["Processing happens via the Jhatpat server API; large PDFs can take longer."],
    faqs: [
      { question: "Why does it use a job ID?", answer: "Conversion can take time, so the tool runs as a background job with status updates." },
      { question: "Do I get all pages?", answer: "Yes. The ZIP contains the rendered page images." },
      { question: "Is this free?", answer: "Yes, it’s free to use." },
    ],
    related: PDF_RELATED,
  },

  "/tools/csv-to-json": {
    path: "/tools/csv-to-json",
    title: "CSV to JSON Converter (with options) | Jhatpat",
    description: "Convert CSV to JSON in your browser. Upload a CSV or paste data, then download JSON.",
    keywords: ["csv to json", "convert csv to json", "csv json converter", "jhatpat"],
    applicationCategory: "DeveloperApplication",
    what: ["Convert CSV into JSON with header parsing.", "Supports delimiter selection and transpose/output options."],
    howTo: ["Upload or paste CSV.", "Choose options (delimiter/output).", "Convert and copy/download JSON."],
    notes: ["If you use the AI section, your prompt is sent to the server API for processing."],
    faqs: [
      { question: "Does conversion happen locally?", answer: "CSV parsing and conversion runs in your browser." },
      { question: "Can I convert with a custom delimiter?", answer: "Yes, you can choose a delimiter or use auto-detect." },
      { question: "What is the AI section?", answer: "It sends your prompt to an AI endpoint and returns a response; it is optional." },
    ],
    related: [
      { href: "/tools/json-to-csv", label: "JSON to CSV" },
      { href: "/tools/csv-to-excel", label: "CSV to Excel" },
      { href: "/tools/csv-diff", label: "CSV Diff" },
    ],
  },
  "/tools/json-to-csv": {
    path: "/tools/json-to-csv",
    title: "JSON to CSV Converter | Jhatpat",
    description: "Convert JSON arrays into CSV instantly. Paste JSON or upload a .json file, then download CSV.",
    keywords: ["json to csv", "convert json to csv", "json csv converter", "jhatpat"],
    applicationCategory: "DeveloperApplication",
    what: ["Converts a JSON array of objects into CSV.", "Includes progress feedback and a one-click download."],
    howTo: ["Paste JSON (array of objects).", "Click Convert.", "Download the CSV output."],
    faqs: [
      { question: "What JSON format is required?", answer: "A JSON array of objects (e.g. [{\"a\":1},{\"a\":2}])." },
      { question: "Does it run locally?", answer: "Yes, conversion is done in your browser." },
      { question: "Will it preserve column order?", answer: "The header order is derived from the first object’s keys." },
    ],
    related: [
      { href: "/tools/csv-to-json", label: "CSV to JSON" },
      { href: "/tools/csv-to-excel", label: "CSV to Excel" },
      { href: "/tools/csv-diff", label: "CSV Diff" },
    ],
  },
  "/tools/csv-to-excel": {
    path: "/tools/csv-to-excel",
    title: "CSV to Excel Converter — Create XLSX | Jhatpat",
    description: "Convert CSV to a real Excel (XLSX) file. Upload a CSV and download an XLSX.",
    keywords: ["csv to excel", "csv to xlsx", "convert csv to excel", "jhatpat"],
    applicationCategory: "UtilitiesApplication",
    what: ["Uploads a CSV and returns an XLSX spreadsheet.", "Useful for sharing and opening in Excel/Sheets."],
    howTo: ["Upload a CSV file.", "Click Convert to Excel.", "Download the XLSX output."],
    notes: ["Conversion happens via the Jhatpat server API; avoid uploading sensitive data."],
    faqs: [
      { question: "Does it support large CSV files?", answer: "Very large files may take longer or fail depending on size." },
      { question: "Will formulas be created?", answer: "No—this converts CSV data into a spreadsheet table." },
      { question: "Is it free?", answer: "Yes, it’s free to use." },
    ],
    related: [
      { href: "/tools/csv-to-json", label: "CSV to JSON" },
      { href: "/tools/json-to-csv", label: "JSON to CSV" },
      { href: "/tools/csv-diff", label: "CSV Diff" },
    ],
  },
  "/tools/csv-diff": {
    path: "/tools/csv-diff",
    title: "CSV Diff — Compare Two CSVs by Key | Jhatpat",
    description: "Compare two CSV files using a primary key column. See added, removed, and modified rows.",
    keywords: ["csv diff", "compare csv", "csv compare", "jhatpat"],
    applicationCategory: "DeveloperApplication",
    what: ["Compares two CSV files by a chosen primary key column.", "Highlights added/removed/modified rows."],
    howTo: ["Upload CSV A and CSV B.", "Enter the key column (e.g. id).", "Click Compare CSVs."],
    faqs: [
      { question: "Does it upload my CSV to a server?", answer: "CSV parsing and diffing runs in your browser." },
      { question: "What should I use as a key column?", answer: "Choose a column that uniquely identifies each row, like id or email." },
      { question: "Can I export results?", answer: "Currently results are displayed on-screen; exporting can be added later." },
    ],
    related: [
      { href: "/tools/diffchecker/text", label: "Text Diff Checker" },
      { href: "/tools/csv-to-json", label: "CSV to JSON" },
      { href: "/tools/csv-to-excel", label: "CSV to Excel" },
    ],
  },
  "/tools/diffchecker/text": {
    path: "/tools/diffchecker/text",
    title: "Text Diff Checker — Compare Text Online | Jhatpat",
    description: "Compare two texts line-by-line and see differences clearly. Useful for code, configs, and documents.",
    keywords: ["text diff", "diff checker", "compare text", "online diff", "jhatpat"],
    applicationCategory: "DeveloperApplication",
    what: ["Compares two text blocks and highlights differences.", "Great for quick checks in the browser."],
    howTo: ["Paste text A and text B.", "Run comparison.", "Review highlighted differences."],
    faqs: [
      { question: "Is my text uploaded?", answer: "This tool runs in your browser UI; avoid pasting secrets." },
      { question: "Can I diff code?", answer: "Yes—any plain text works." },
      { question: "Does it support large files?", answer: "Very large content may be slower depending on your device." },
    ],
    related: [
      { href: "/tools/csv-diff", label: "CSV Diff" },
      { href: "/tools/diffchecker", label: "Diff Tools" },
    ],
  },

  "/tools/generators/tinyurl": {
    path: "/tools/generators/tinyurl",
    title: "TinyURL Generator — Shorten Links | Jhatpat",
    description: "Create a short link for any reachable URL. Generates a unique code and returns a /t/ link.",
    keywords: ["url shortener", "tinyurl generator", "short link", "jhatpat"],
    applicationCategory: "UtilitiesApplication",
    what: ["Validates a URL is reachable, then generates a short /t/ link.", "Same URL can return the same short code."],
    howTo: ["Paste an original URL.", "Click Create TinyURL.", "Copy and share the short link."],
    notes: ["Short links are stored in your backend database to allow redirects."],
    faqs: [
      { question: "Why does it say URL not reachable?", answer: "The service checks the target URL with a HEAD/GET request before creating a short link." },
      { question: "Do you support non-HTTP links?", answer: "Only http:// and https:// URLs are supported." },
      { question: "How long do links last?", answer: "They remain available as long as the service keeps the mapping in its database." },
    ],
    related: [
      { href: "/tools/generators/slug", label: "Slug Generator" },
      { href: "/tools/generators/guid", label: "GUID Generator" },
    ],
  },
  "/tools/generators/dummy-data": {
    path: "/tools/generators/dummy-data",
    title: "Dummy Data Generator — JSON/CSV/SQL | Jhatpat",
    description: "Generate realistic dummy data for testing in multiple formats like JSON, CSV, SQL, and more.",
    keywords: ["dummy data generator", "test data generator", "fake data", "json generator", "jhatpat"],
    applicationCategory: "DeveloperApplication",
    what: ["Create quick datasets for testing APIs, UIs, and databases.", "Export to formats like JSON, CSV, SQL, and XML."],
    howTo: ["Choose fields and row count.", "Pick an output format.", "Generate and copy/export the result."],
    faqs: [
      { question: "Does this generate real personal data?", answer: "No. It generates synthetic sample data for testing." },
      { question: "Does it run locally?", answer: "Yes, data generation and formatting run in your browser." },
      { question: "Can I customize fields?", answer: "Yes, you can add and configure fields." },
    ],
    related: [
      { href: "/tools/generators/password", label: "Password Generator" },
      { href: "/tools/generators/guid", label: "GUID Generator" },
      { href: "/tools/csv-to-json", label: "CSV to JSON" },
    ],
  },
  "/tools/generators/guid": {
    path: "/tools/generators/guid",
    title: "GUID/UUID Generator — Bulk UUID v4 | Jhatpat",
    description: "Generate GUIDs/UUIDs in bulk. Copy or download instantly.",
    keywords: ["uuid generator", "guid generator", "uuid v4", "bulk uuid", "jhatpat"],
    applicationCategory: "DeveloperApplication",
    what: ["Generate UUID v4 values in bulk for testing and databases.", "Supports casing and optional braces."],
    howTo: ["Choose count and formatting.", "Click Generate.", "Copy or download the list."],
    faqs: [
      { question: "Does it use crypto randomness?", answer: "Yes, it uses browser crypto APIs when available." },
      { question: "Can I generate 100s of UUIDs?", answer: "This page supports up to 100 at once." },
      { question: "Is it free?", answer: "Yes, it’s free to use." },
    ],
    related: [
      { href: "/tools/generators/password", label: "Password Generator" },
      { href: "/tools/generators/slug", label: "Slug Generator" },
      { href: "/tools/generators/tinyurl", label: "TinyURL Generator" },
    ],
  },
  "/tools/generators/password": {
    path: "/tools/generators/password",
    title: "Password Generator — Strong Random Passwords | Jhatpat",
    description: "Generate secure random passwords in your browser. Control length and character sets.",
    keywords: ["password generator", "strong password", "random password", "secure password", "jhatpat"],
    applicationCategory: "SecurityApplication",
    what: ["Generate strong random passwords locally using browser crypto.", "Customize length, symbols, and ambiguity rules."],
    howTo: ["Choose options (length/sets).", "Click Generate.", "Copy the password."],
    faqs: [
      { question: "Is the password generated locally?", answer: "Yes, password generation happens in your browser using crypto APIs." },
      { question: "Do you store passwords?", answer: "No. Generated passwords are shown to you and can be copied." },
      { question: "What length should I use?", answer: "For most accounts, 16–24 characters is a strong default." },
    ],
    related: [
      { href: "/tools/generators/guid", label: "GUID Generator" },
      { href: "/tools/generators/slug", label: "Slug Generator" },
    ],
  },
  "/tools/generators/slug": {
    path: "/tools/generators/slug",
    title: "Slug Generator — Create URL Slugs | Jhatpat",
    description: "Turn any text into a clean URL slug. Choose separators, casing, and max length.",
    keywords: ["slug generator", "url slug", "slugify", "kebab case", "jhatpat"],
    applicationCategory: "DeveloperApplication",
    what: ["Convert titles into clean slugs for URLs.", "Controls for separator, casing, and max length."],
    howTo: ["Paste text.", "Adjust options.", "Copy or download the slug."],
    faqs: [
      { question: "Does it remove special characters?", answer: "Yes. It keeps letters/numbers and converts spaces to separators." },
      { question: "Does it run locally?", answer: "Yes, slug generation runs in your browser." },
      { question: "Can I use underscores?", answer: "Yes, you can choose dash or underscore separators." },
    ],
    related: [
      { href: "/tools/generators/tinyurl", label: "TinyURL Generator" },
      { href: "/tools/generators/guid", label: "GUID Generator" },
    ],
  },
  "/tools/generators/box-shadow": {
    path: "/tools/generators/box-shadow",
    title: "Box Shadow Generator — CSS Shadow Builder | Jhatpat",
    description: "Generate beautiful CSS box-shadow values with live preview. Copy or download CSS.",
    keywords: ["box shadow generator", "css box shadow", "shadow css", "jhatpat"],
    applicationCategory: "DeveloperApplication",
    what: ["Build box-shadow CSS with sliders.", "Preview and export the result."],
    howTo: ["Adjust offsets/blur/spread/opacity.", "Preview the card.", "Copy or download the CSS."],
    faqs: [
      { question: "Does it run locally?", answer: "Yes, it runs in your browser." },
      { question: "Can I generate random shadows?", answer: "Yes, use the Random button for quick variations." },
      { question: "Is it free?", answer: "Yes, it’s free to use." },
    ],
    related: [
      { href: "/tools/generators/slug", label: "Slug Generator" },
      { href: "/tools/diffchecker/text", label: "Text Diff Checker" },
    ],
  },
  "/tools/diagrams": {
    path: "/tools/diagrams",
    title: "Online Diagramming — BPMN, ERD, Architecture | Jhatpat",
    description: "Create diagrams like BPMN, ERD, swimlanes, and architecture diagrams. No signup required.",
    keywords: ["diagramming", "bpmn", "swimlane diagram", "erd diagram", "architecture diagram", "jhatpat"],
    applicationCategory: "DesignApplication",
    what: ["Create multiple diagram types from your browser.", "Your recent diagrams list is stored locally in this browser."],
    howTo: ["Click New Diagram.", "Choose a type.", "Edit and export/share as needed."],
    notes: ["Diagram IDs can be opened directly; access behavior depends on the edit key saved in your browser."],
    faqs: [
      { question: "Do I need an account?", answer: "No—diagramming works without creating an account." },
      { question: "Where are my recent diagrams stored?", answer: "Recents are saved locally in your browser for convenience." },
      { question: "Can I share a diagram?", answer: "You can share the diagram ID link; editing depends on the edit key." },
    ],
    related: [
      { href: "/tools/diagrams/system-architecture", label: "System Architecture" },
      { href: "/tools/diagrams/erd", label: "ER Diagram" },
      { href: "/tools/diagrams/swimlanes", label: "Swimlanes" },
      { href: "/tools/diagrams/data-architecture", label: "Data Architecture" },
    ],
  },

  "/tools/diagrams/system-architecture": {
    path: "/tools/diagrams/system-architecture",
    title: "System Architecture Diagram Tool | Jhatpat",
    description:
      "Create system architecture diagrams: services, APIs, databases, queues, and integrations. Export SVG and share instantly.",
    keywords: ["system architecture diagram", "architecture diagram", "service map", "diagram tool", "jhatpat"],
    applicationCategory: "DesignApplication",
    what: [
      "Create clear architecture diagrams for services, APIs, databases, and integrations.",
      "Export to SVG for documentation and presentations.",
    ],
    howTo: ["Click Create Architecture Diagram.", "Add components and connections.", "Export SVG when ready."],
    faqs: [
      { question: "Can I export the diagram?", answer: "Yes. You can export to SVG for docs and slides." },
      { question: "Do I need an account?", answer: "No. Diagramming works without signup." },
      { question: "Are diagrams public?", answer: "Diagram links can be shared; editing depends on the edit key saved in your browser." },
    ],
    related: [
      { href: "/tools/diagrams", label: "Diagrams Hub" },
      { href: "/tools/diagrams/bpmn", label: "BPMN" },
      { href: "/tools/diagrams/erd", label: "ERD" },
      { href: "/tools/diagrams/data-architecture", label: "Data Architecture" },
    ],
  },

  "/tools/diagrams/swimlanes": {
    path: "/tools/diagrams/swimlanes",
    title: "Swimlane Diagram Tool | Jhatpat",
    description:
      "Create swimlane diagrams to visualize handoffs across teams, systems, or departments. AI-assisted lane generation and SVG export.",
    keywords: ["swimlane diagram", "process diagram", "handoff diagram", "workflow lanes", "jhatpat"],
    applicationCategory: "DesignApplication",
    what: [
      "Model handoffs across teams and systems using lanes.",
      "Generate or adjust lanes quickly and export to SVG for documentation.",
    ],
    howTo: ["Click Create Swimlane Diagram.", "Add tasks and actors.", "Generate lanes (optional) and export."],
    faqs: [
      { question: "What is a swimlane diagram?", answer: "A swimlane diagram shows responsibilities split across lanes (teams/systems) within a process." },
      { question: "Does it support AI lane suggestions?", answer: "Yes. You can generate lanes from your inputs where available." },
      { question: "Can I export?", answer: "Yes. SVG export is available for sharing and docs." },
    ],
    related: [
      { href: "/tools/diagrams", label: "Diagrams Hub" },
      { href: "/tools/diagrams/bpmn", label: "BPMN" },
      { href: "/tools/diagrams/system-architecture", label: "System Architecture" },
    ],
  },

  "/tools/diagrams/erd": {
    path: "/tools/diagrams/erd",
    title: "ER Diagram (ERD) Tool — Tables, PK/FK, SQL Export | Jhatpat",
    description:
      "Create ERD diagrams with entities, fields, PK/FK constraints, and relationships. Export SQL and documentation.",
    keywords: ["erd", "er diagram", "database diagram", "schema design", "sql export", "jhatpat"],
    applicationCategory: "DeveloperApplication",
    what: [
      "Design database schemas visually with entities and relationships.",
      "Export PostgreSQL DDL and share diagrams for review.",
    ],
    howTo: ["Click Create ERD.", "Add entities and fields (PK/FK).", "Export SQL or SVG when ready."],
    faqs: [
      { question: "Can I export SQL?", answer: "Yes. Export generates PostgreSQL DDL (best-effort)." },
      { question: "Can I import SQL?", answer: "If supported on the editor, import can parse basic CREATE TABLE statements (best-effort)." },
      { question: "Does it support PK/FK?", answer: "Yes. You can mark fields as PK/FK and link relationships." },
    ],
    related: [
      { href: "/tools/diagrams", label: "Diagrams Hub" },
      { href: "/tools/diagrams/data-architecture", label: "Data Architecture" },
      { href: "/tools/diagrams/system-architecture", label: "System Architecture" },
    ],
  },

  "/tools/diagrams/data-architecture": {
    path: "/tools/diagrams/data-architecture",
    title: "Data Architecture Diagram Tool | Jhatpat",
    description:
      "Create professional data architecture diagrams: sources, ingestion, processing, storage, analytics, governance and security. Export SVG/PNG and JSON.",
    keywords: ["data architecture diagram", "data pipeline diagram", "lakehouse diagram", "etl diagram", "jhatpat"],
    applicationCategory: "DesignApplication",
    what: [
      "Create reference-style data architecture diagrams with layered nodes and containers.",
      "Export SVG/PNG for docs and JSON for version control and re-import.",
    ],
    howTo: ["Click Create Data Architecture Diagram.", "Add nodes/containers and connect flows.", "Export SVG/PNG or JSON."],
    faqs: [
      { question: "What can I export?", answer: "You can export the diagram for sharing (SVG/PNG) and JSON for re-importing." },
      { question: "Does it include icon packs?", answer: "Yes. Icon packs can be used to visually represent common services." },
      { question: "Is it good for lakehouse diagrams?", answer: "Yes—templates and containers are designed for modern data architectures." },
    ],
    related: [
      { href: "/tools/diagrams", label: "Diagrams Hub" },
      { href: "/tools/diagrams/erd", label: "ERD" },
      { href: "/tools/diagrams/system-architecture", label: "System Architecture" },
    ],
  },

  "/tools/diagrams/bpmn": {
    path: "/tools/diagrams/bpmn",
    title: "BPMN Diagram Tool | Jhatpat",
    description:
      "Create BPMN-style process diagrams with tasks, gateways, and subprocess drilldowns. Export and share quickly.",
    keywords: ["bpmn", "process diagram", "workflow diagram", "business process model", "jhatpat"],
    applicationCategory: "DesignApplication",
    what: ["Model business processes with BPMN-style nodes and flows.", "Use subprocess drilldowns for complex workflows."],
    howTo: ["Go to Diagrams Hub.", "Create a new BPMN diagram.", "Add nodes and connect flows."],
    faqs: [
      { question: "What is BPMN?", answer: "BPMN is a standard notation for modeling business processes using flows, tasks, and gateways." },
      { question: "Does it support subprocesses?", answer: "Yes. You can create subprocess drilldowns for deeper steps." },
      { question: "Can I export?", answer: "Yes—exports are available for sharing (format depends on the editor)." },
    ],
    related: [
      { href: "/tools/diagrams", label: "Diagrams Hub" },
      { href: "/tools/diagrams/swimlanes", label: "Swimlanes" },
      { href: "/tools/diagrams/system-architecture", label: "System Architecture" },
    ],
  },

  // Action route: creates a new diagram based on query params.
  // Keep it out of the sitemap and mark noindex via route-level metadata.
  "/tools/diagrams/new": {
    path: "/tools/diagrams/new",
    title: "Create Diagram | Jhatpat",
    description: "Creates a new diagram and redirects you to the editor.",
    keywords: ["create diagram", "diagram editor", "jhatpat"],
    applicationCategory: "DesignApplication",
    indexable: false,
    what: ["Creates a new diagram instance and redirects to the editor."],
    howTo: ["Choose a diagram type.", "Wait for creation.", "You will be redirected to the editor."],
    faqs: [{ question: "Should this page appear in Google?", answer: "No. This route is for creating a new diagram and redirects." }],
    related: [{ href: "/tools/diagrams", label: "Diagrams Hub" }],
  },
};

export function getToolSeo(path: string): ToolSeoConfig {
  const cfg = TOOL_SEO[path];
  if (!cfg) {
    throw new Error(`Missing TOOL_SEO config for path: ${path}`);
  }
  return {
    ...cfg,
    path: cfg.path,
    title: cfg.title,
    description: cfg.description,
    keywords: [...cfg.keywords],
    indexable: cfg.indexable ?? true,
  };
}

export function toolUrl(path: string) {
  return absUrl(path);
}
