export const calcularMargen = (ingresos, costos) => {

    if(!ingresos || ingresos === 0){
        return 0;
    }

    return Number(
        (((ingresos - costos) / ingresos) * 100).toFixed(2)
    );

};