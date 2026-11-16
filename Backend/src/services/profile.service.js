import pool from "../config/db.js";
import bcrypt from "bcrypt";


export const obtenerPerfil = async (id) => {

    const result = await pool.request()
      .input("id", id)
      .query(`
        SELECT
          id,
          name,
          company_name,
          company_role,
          email,
          telefono,
          direccion,
          fotoPerfil
        FROM users
        WHERE id = @id;
      `);


    return result.recordset[0];
};



export const actualizarPerfil = async (id, datos) => {

    const {
        name,
        company_name,
        email,
        telefono,
        direccion
    } = datos;


    const result = await pool.request()

      .input("id", id)
      .input("name", name)
      .input("company_name", company_name)
      .input("email", email)
      .input("telefono", telefono)
      .input("direccion", direccion)

      .query(`
        UPDATE users
        SET
          name = @name,
          company_name = @company_name,
          email = @email,
          telefono = @telefono,
          direccion = @direccion,
          updated_at = GETDATE()
        WHERE id = @id;
      `);


    return result.rowsAffected[0];

};



export const actualizarFoto = async (id, ruta) => {


    const result = await pool.request()

    .input("id", id)
    .input("foto", ruta)

    .query(`
        UPDATE users
        SET fotoPerfil = @foto
        WHERE id = @id
    `);


    return result.rowsAffected[0];

};



export const cambiarContrasena = async (
    id,
    passwordActual,
    passwordNueva
)=>{


    const usuario = await pool.request()

    .input("id", id)

    .query(`
        SELECT password
        FROM users
        WHERE id=@id
    `);



    if(usuario.recordset.length === 0){
        return null;
    }



    const coincide = await bcrypt.compare(
        passwordActual,
        usuario.recordset[0].password
    );


    if(!coincide){
        return false;
    }



    const nuevaPassword = await bcrypt.hash(
        passwordNueva,
        10
    );



    await pool.request()

    .input("id",id)
    .input("password",nuevaPassword)

    .query(`
        UPDATE users
        SET password=@password
        WHERE id=@id
    `);



    return true;

};




export const obtenerPreferencias = async(id)=>{


    const result = await pool.request()

    .input("id",id)

    .query(`
        SELECT
            email_notifications,
            push_notifications,
            ventas_notifications,
            inventario_notifications,
            clientes_notifications,
            theme,
            language,
            date_format,
            timezone
        FROM user_preferences
        WHERE user_id=@id
    `);


    return result.recordset[0];

};

export const obtenerApariencia = async (id) => {
    const result = await pool.request()
      .input("id", id)
      .query("SELECT theme, language, date_format, timezone FROM user_preferences WHERE user_id=@id");
    return result.recordset[0];
};

export const actualizarApariencia = async (id, datos) => {
    const result = await pool.request()
      .input("id", id)
      .input("theme", datos.theme)
      .input("language", datos.language)
      .input("date_format", datos.date_format)
      .input("timezone", datos.timezone)
      .query(`
        UPDATE user_preferences
        SET theme=@theme, language=@language, date_format=@date_format, timezone=@timezone
        WHERE user_id=@id
      `);
    return result.rowsAffected[0];
};


export const actualizarPreferencias = async(id,datos)=>{


    const {
        email,
        push,
        ventas,
        inventario,
        clientes
    } = datos;


    const result = await pool.request()

    .input("id",id)
    .input("email",email)
    .input("push",push)
    .input("ventas",ventas)
    .input("inventario",inventario)
    .input("clientes",clientes)


    .query(`
        UPDATE user_preferences
        SET
            email_notifications=@email,
            push_notifications=@push,
            ventas_notifications=@ventas,
            inventario_notifications=@inventario,
            clientes_notifications=@clientes
        WHERE user_id=@id
    `);


    return result.rowsAffected[0];

};