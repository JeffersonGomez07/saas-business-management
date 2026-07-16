export const generarCodigoVenta = (ultimoCodigo) => {

  if (!ultimoCodigo) {
    return "V0001";
  }

  const numeroActual = parseInt(
    ultimoCodigo.substring(1)
  );

  if (isNaN(numeroActual)) {
    return "V0001";
  }

  return "V" + (numeroActual + 1)
    .toString()
    .padStart(4, "0");
};