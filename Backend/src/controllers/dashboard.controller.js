import * as dashboardService from "../services/dashboard.service.js";

export const obtenerResumen = async (req,res)=>{

    try{
        const resumen = await dashboardService.obtenerResumen();
        res.json(resumen);

    }catch(error){
        console.error(error);
        res.status(500).json({
            mensaje:"Error al obtener el resumen"
        });
    }
}

export const obtenerVentasMensuales = async(req,res)=>{

    try{
        const ventasMensuales =
            await dashboardService.obtenerVentasMensuales();
        res.json({
            ventasMensuales
        });

    }catch(error){
        console.error(error);
        res.status(500).json({
            mensaje:"Error al obtener ventas mensuales"
        });
    }
}

export const obtenerVentasCategorias = async (req, res) => {
  try {
    const ventasCategorias =
      await dashboardService.obtenerVentasCategorias();

    res.json({ ventasCategorias });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Error al obtener las ventas por categoría",
    });
  }
};

export const obtenerDistribucionProductos = async (req, res) => {
  try {
    const distribucionProductos =
      await dashboardService.obtenerDistribucionProductos();

    res.json({ distribucionProductos });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al obtener la distribución de productos",
    });
  }
};

export const obtenerVentasRecientes = async (req, res) => {
  try {
    const ventasRecientes =
      await dashboardService.obtenerVentasRecientes();

    res.json({ ventasRecientes });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al obtener las ventas recientes",
    });
  }
};