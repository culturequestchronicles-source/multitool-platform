type JsonLdValue = Record<string, unknown> | Array<Record<string, unknown>>;

export default function JsonLd({ value, id }: { value: JsonLdValue; id?: string }) {
  const json = JSON.stringify(value);
  return (
    <script
      id={id}
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

