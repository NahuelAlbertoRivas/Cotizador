import axios from "axios";

export const api = axios.create({
    baseURL: "https://cotizador-634x.onrender.com",
});
