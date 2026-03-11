import { useState, useEffect } from "react";
import { api } from "./api";

export default function QuoteGenerator({ refreshFlag }) {
    const [products, setProducts] = useState([]);
    const [items, setItems] = useState([]);

    const [cliente, setCliente] = useState("");
    const [asesor, setAsesor] = useState("");

    const [fechaEmision, setFechaEmision] = useState("");
    const [fechaCaducidad, setFechaCaducidad] = useState("");

    const [descuento, setDescuento] = useState(0);

    function loadProducts() {
    api.get("/products").then((r) => setProducts(r.data));
    }

    useEffect(() => {
        loadProducts();
    }, [refreshFlag]); // se ejecuta también cuando cambia la flag

    function addItem() {
        setItems([...items, { producto: "", cantidad: 1 }]);
    }

    const total = items.reduce((sum, i) => {
        const p = products.find((x) => x.id === i.producto);

        if (!p) return sum;

        const subtotal = Number((p.precio * i.cantidad).toFixed(2));
        return sum + subtotal;
    }, 0);

    const totalFinal = total - total * (descuento / 100);

    // Redondear a 2 decimales
    const totalFinalRounded = Number(totalFinal.toFixed(2));

    function generar() {
        const itemsPayload = items.map((i) => {
            const p = products.find((x) => x.id === i.producto);
            if (!p) return null; // saltar si no hay producto seleccionado

            const subtotal = parseFloat((p.precio * i.cantidad).toFixed(2));
            return {
                nombre: p.nombre,
                cantidad: i.cantidad,
                subtotal,
            };
        }).filter(Boolean); // elimina los null

        const payload = {
            cliente,
            asesor,
            fechaEmision,
            fechaCaducidad,
            descuento,
            total: totalFinalRounded,

            items: itemsPayload,
        };

        api.post("/pdf", payload, { responseType: "blob" }).then((res) => {
            const url = window.URL.createObjectURL(res.data);

            const a = document.createElement("a");

            a.href = url;

            a.download = "cotizacion.pdf";

            a.click();
        })
        .catch((err) => {
            console.error(err);
            alert("Error al generar PDF");
        });
    }

    return (
        <div>
            <h2>Cotización</h2>

            <input placeholder="Cliente" onChange={(e) => setCliente(e.target.value)} />
            <input placeholder="Asesor" onChange={(e) => setAsesor(e.target.value)} />

            <input type="date" onChange={(e) => setFechaEmision(e.target.value)} />
            <input type="date" onChange={(e) => setFechaCaducidad(e.target.value)} />

            <h3>Detalle</h3>

            <button onClick={addItem}>Agregar línea</button>

            {items.map((i, idx) => (
                <div key={idx} style={{ marginBottom: "8px" }}>
                    <select
                        onChange={(e) => {
                            const copy = [...items];
                            copy[idx].producto = e.target.value;
                            setItems(copy);
                        }}
                        value={i.producto}
                    >
                        <option value="">-- Seleccionar producto --</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.nombre}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        value={i.cantidad}
                        min="1"
                        onChange={(e) => {
                            const copy = [...items];
                            copy[idx].cantidad = Math.max(1, parseInt(e.target.value) || 1);
                            setItems(copy);
                        }}
                    />

                    <button
                        type="button"
                        onClick={() => {
                            const copy = items.filter((_, index) => index !== idx);
                            setItems(copy);
                        }}
                    >
                        Eliminar
                    </button>
                </div>
            ))}

            <h3>Total: {totalFinalRounded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>

            <input placeholder="Descuento %" type="number" onChange={(e) => setDescuento(parseFloat(e.target.value) || 0)} />

            <button onClick={generar}>Exportar PDF</button>
        </div>
    );
}
