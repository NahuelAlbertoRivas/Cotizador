import { useEffect, useState } from "react";
import { api } from "./api";
import ProductModal from "./ProductModal";
import "./ProductManager.css";

export default function ProductManager(props) {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(null);

    useEffect(() => load(), []);

    function load() {
        api.get("/api/products").then((r) => {
            if (Array.isArray(r.data)) {
                setProducts(r.data);
            } else {
                console.error("API devolvió algo inesperado:", r.data);
                setProducts([]);
            }
        });
    }

    const filtered = Array.isArray(products)
        ? products.filter(
            (p) =>
                p.id.includes(search) ||
                p.nombre.toLowerCase().includes(search.toLowerCase())
            )
        : [];

    async function importJSON(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            const r = await api.post("/products/import", data);

            alert("Duplicados: " + (r.data.duplicados?.join(",") || "ninguno"));

            load();
            props.onProductAdded?.(); // avisa a App que hay productos nuevos
        } catch (err) {
            console.error(err);
            alert("Error importando JSON");
        }
    }


    return (
        <div>
            <h2>Productos</h2>

            <input placeholder="Buscar" onChange={(e) => setSearch(e.target.value)} />

            <input type="file" onChange={importJSON} />

            <button onClick={() => setModal({})}>Nuevo</button>

            <table className="product-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    {filtered.map((p) => (
                        <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.nombre}</td>
                        <td>${Number(p.precio).toFixed(2)}</td>
                        <td>
                            <button onClick={() => setModal(p)}>Editar</button>
                            <button
                            onClick={() => api.delete("/products/" + p.id).then(load)}
                            style={{ marginLeft: "0.5rem" }}
                            >
                            Eliminar
                            </button>
                        </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {modal && (
                <ProductModal
                    product={modal}
                    close={() => {
                        setModal(null);
                        load();
                        props.onProductAdded?.(); // avisa a App si se edita/guarda un producto
                    }}
                />
            )}
        </div>
    );
}
