
export function toCsv(rows) {
  if (!rows || rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);

  const cell = (value) => {
    const text = String(value ?? "");

    if (/[",\r\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
  };

  return [
    headers.map(cell).join(","),
    ...rows.map((row) =>
      headers.map((header) => cell(row[header])).join(",")
    ),
  ].join("\r\n");
}
