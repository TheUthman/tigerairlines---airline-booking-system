function formatNaira(amount, showKobo = false) {
  if (showKobo) {
    return "\u20A6" + amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  const hasKobo = amount % 1 !== 0;
  return "\u20A6" + amount.toLocaleString("en-NG", {
    minimumFractionDigits: hasKobo ? 2 : 0,
    maximumFractionDigits: hasKobo ? 2 : 0
  });
}
export {
  formatNaira
};
