export const formatMoneda = (valor) => {
  if (valor === null || valor === undefined) {
    return "₡0.00";
  }

  return Number(valor).toLocaleString("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2,
  });
};