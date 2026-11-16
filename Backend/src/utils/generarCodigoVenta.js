export const generarCodigoVenta = (ultimoCodigo, companyId) => {

  const numeroActual = ultimoCodigo
    ? parseInt(ultimoCodigo.substring(ultimoCodigo.lastIndexOf("-") + 1), 10)
    : 0;

  const siguiente = Number.isNaN(numeroActual) ? 1 : numeroActual + 1;

  return `V${companyId}-${siguiente.toString().padStart(4, "0")}`;
};