const entradaTarea = document.getElementById("entradaTarea");
const botonAgregarTarea = document.getElementById("botonAgregarTarea");
const listaTareas = document.getElementById("listaTareas");
const botonLimpiarCompletadas = document.getElementById("limpiarCompletadas");
const botonMostrarTodas = document.getElementById("mostrarTodas");
const botonMostrarPendientes = document.getElementById("mostrarPendientes");
const botonMostrarCompletadas = document.getElementById("mostrarCompletadas");
const mostrarTareaMasRapida = document.getElementById("tareaMasRapida");

let tareas = JSON.parse(localStorage.getItem("tareas")) || [];

const guardarTareas = () => {
    localStorage.setItem("tareas", JSON.stringify(tareas));
};

const formatearFecha = (isoString) => {
    return new Date(isoString).toLocaleString("es-ES");
};

const renderizarTareas = (filtro = "todas") => {
    listaTareas.innerHTML = "";

    const tareasFiltradas = tareas.filter(tarea => {
        if (filtro === "pendientes") return !tarea.completada;
        if (filtro === "completadas") return tarea.completada;
        return true;
    });

    tareasFiltradas.forEach(tarea => {
        const li = document.createElement("li");
        li.classList.add("elemento-tarea");
        if (tarea.completada) li.classList.add("completada");

        li.innerHTML = `
            <span>${tarea.texto} <small>(${formatearFecha(tarea.creadaEn)})</small></span>
            <div>
                <button onclick="alternarCompletada(${tarea.id})">✅</button>
                <button onclick="eliminarTarea(${tarea.id})">🗑️</button>
            </div>
        `;
        listaTareas.appendChild(li);
    });

    calcularTareaMasRapida();
};

const agregarTarea = () => {
    const texto = entradaTarea.value.trim();
    if (!texto) return;

    const nuevaTarea = {
        id: Date.now(),
        texto,
        completada: false,
        creadaEn: new Date().toISOString(),
        completadaEn: null
    };

    tareas.push(nuevaTarea);
    guardarTareas();
    renderizarTareas();
    entradaTarea.value = "";
};

const alternarCompletada = (idTarea) => {
    tareas = tareas.map(tarea => {
        if (tarea.id === idTarea) {
            tarea.completada = !tarea.completada;
            tarea.completadaEn = tarea.completada ? new Date().toISOString() : null;
        }
        return tarea;
    });
    guardarTareas();
    renderizarTareas();
};

const eliminarTarea = (idTarea) => {
    tareas = tareas.filter(tarea => tarea.id !== idTarea);
    guardarTareas();
    renderizarTareas();
};

const limpiarCompletadas = () => {
    tareas = tareas.filter(tarea => !tarea.completada);
    guardarTareas();
    renderizarTareas();
};

const calcularTareaMasRapida = () => {
    const tareasCompletadas = tareas.filter(t => t.completada && t.completadaEn);
    if (tareasCompletadas.length === 0) {
        mostrarTareaMasRapida.textContent = "No hay tareas aún.";
        return;
    }

    let masRapida = tareasCompletadas.reduce((masRapida, t) => {
        const tiempo = new Date(t.completadaEn) - new Date(t.creadaEn);
        return tiempo < masRapida.tiempo ? { tarea: t, tiempo } : masRapida;
    }, { tarea: null, tiempo: Infinity });

    const segundos = (masRapida.tiempo / 1000).toFixed(2);
    mostrarTareaMasRapida.textContent = `Tarea completada más rápido: "${masRapida.tarea.texto}" en ${segundos} segundos.`;
};

botonAgregarTarea.addEventListener("click", agregarTarea);
entradaTarea.addEventListener("keypress", (e) => {
    if (e.key === "Enter") agregarTarea();
});

botonLimpiarCompletadas.addEventListener("click", limpiarCompletadas);
botonMostrarTodas.addEventListener("click", () => renderizarTareas("todas"));
botonMostrarPendientes.addEventListener("click", () => renderizarTareas("pendientes"));
botonMostrarCompletadas.addEventListener("click", () => renderizarTareas("completadas"));

document.addEventListener("DOMContentLoaded", renderizarTareas);
