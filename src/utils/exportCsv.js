function exportToCsv(filename, rows, headers) {
  if (!rows || rows.length === 0) return;
  const columnKeys = headers ? headers.map((h) => h.key) : Object.keys(rows[0]);
  const columnLabels = headers ? headers.map((h) => h.label) : columnKeys.map((k) => String(k));
  const csvRows = [];
  csvRows.push(columnLabels.map((lbl) => `"${lbl.replace(/"/g, '""')}"`).join(","));
  for (const row of rows) {
    const values = columnKeys.map((key) => {
      const val = row[key];
      if (val === null || val === void 0) return '""';
      if (typeof val === "object") return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }
  const csvString = csvRows.join("\r\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename.replace(/\.csv$/, "")}_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
var stdin_default = exportToCsv;
export {
  stdin_default as default,
  exportToCsv
};
