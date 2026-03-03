/**
 * Simple CSV parser for Metasploit export files.
 * Handles quoted fields (all fields in our CSVs are double-quoted).
 */
export function parseCsv<T extends Record<string, string>>(raw: string): T[] {
  const lines = raw.trim().split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const rows: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length !== headers.length) continue; // skip malformed rows
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j];
    }
    rows.push(row as T);
  }
  return rows;
}

/**
 * Parse a single CSV line, handling double-quoted fields.
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let i = 0;
  const len = line.length;

  while (i < len) {
    if (line[i] === '"') {
      // Quoted field
      i++; // skip opening quote
      let value = "";
      while (i < len) {
        if (line[i] === '"') {
          if (i + 1 < len && line[i + 1] === '"') {
            // Escaped quote
            value += '"';
            i += 2;
          } else {
            // End of quoted field
            i++; // skip closing quote
            break;
          }
        } else {
          value += line[i];
          i++;
        }
      }
      fields.push(value);
      if (i < len && line[i] === ",") i++; // skip comma
    } else {
      // Unquoted field
      let end = line.indexOf(",", i);
      if (end === -1) end = len;
      fields.push(line.substring(i, end));
      i = end + 1;
    }
  }

  return fields;
}

/** CSV row types for our Metasploit exports */
export interface HostCsvRow {
  address: string;
  mac: string;
  name: string;
  os_name: string;
  os_flavor: string;
  os_sp: string;
  purpose: string;
  info: string;
  comments: string;
}

export interface ServiceCsvRow {
  host: string;
  port: string;
  proto: string;
  name: string;
  state: string;
  info: string;
}

export interface NoteCsvRow {
  Time: string;
  Host: string;
  Service: string;
  Port: string;
  Protocol: string;
  Type: string;
  Data: string;
}
