import { useState } from "react";
import { api } from "./api";

export default function ProductModal({ product, close }) {
    const [id, setId] = useState(product.id || "");
    const [nombre, setNombre] = useState(product.nombre || "");
    const [precio, setPrecio] = useState(product.precio || "");
    const [descripcion, setDescripcion] = useState(product.descripcion || "");

    function save() {
        const data = { id, nombre, precio, descripcion };

        if (product.id) {
            api.put("/products/" + id, data).then(close);
        } else {
            api.post("/products", data).then(close);
        }
    }

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "#0005",
            }}
        >
            <div
                style={{
                    background: "#fff",
                    padding: 20,
                    width: 300,
                    margin: "100px auto",
                }}
            >
                <h3>Producto</h3>

                <input placeholder="ID" value={id} onChange={(e) => setId(e.target.value)} />

                <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />

                <input placeholder="Precio" value={precio} onChange={(e) => setPrecio(e.target.value)} />

                <textarea placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />

                <button onClick={save}>Guardar</button>

                <button onClick={close}>Cerrar</button>
            </div>
        </div>
    );
}
