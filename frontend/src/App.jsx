import { useState } from "react";
import ProductManager from "./ProductManager";
import QuoteGenerator from "./QuoteGenerator";

export default function App() {
    // Flag para “avisar” a QuoteGenerator que recargue productos
    const [refreshFlag, setRefreshFlag] = useState(false);

    // Función que se pasa a ProductManager para avisar cuando se agrega un producto
    function handleProductAdded() {
        setRefreshFlag(!refreshFlag); // cambia el flag → QuoteGenerator recarga
    }

    return (
        <div style={{ padding: 40 }}>
        <h1>Cotizador</h1>

        {/* Pasamos el callback a ProductManager */}
        <ProductManager onProductAdded={handleProductAdded} />

        <hr />

        {/* Pasamos el flag a QuoteGenerator */}
        <QuoteGenerator refreshFlag={refreshFlag} />
        </div>
    );
}
