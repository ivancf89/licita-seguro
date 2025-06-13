const API_KEY = 'AC3A098B-4CD0-41AF-81A5-41284248419B';
const BASE_API = 'https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json';
const BACKUP_API = 'https://clinicatecnologica.cl/ipss/api/mercadoPublico/resultado.json';

const estadosTexto = {
  "5": "Publicada",
  "6": "Cerrada",
  "7": "Desierta",
  "8": "Adjudicada",
  "18": "Revocada",
  "19": "Suspendida"
};

document.getElementById('filtro-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fecha = document.getElementById('fecha').value.trim();
  const estado = document.getElementById('estado').value.trim().toLowerCase();

  if (!fecha || !estado) {
    mostrarError('Por favor completa ambos filtros.');
    return;
  }

  const url = `${BASE_API}?fecha=${fecha}&estado=${estado}&ticket=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Falla API oficial");
    const data = await res.json();
    mostrarLicitaciones(data.Listado || []);
  } catch (err) {
    console.warn("API oficial falló, usando respaldo...");
    usarRespaldo();
  }
});

async function usarRespaldo() {
  try {
    const res = await fetch(BACKUP_API);
    const data = await res.json();
    mostrarLicitaciones(data);
  } catch (err) {
    mostrarError("No se pudo acceder ni a la API oficial ni al respaldo.");
  }
}

function mostrarLicitaciones(lista) {
  const contenedor = document.getElementById('contenedor-licitaciones');
  contenedor.innerHTML = `
    <table id="tablaLicitaciones" class="display table table-striped">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Código</th>
          <th>Estado</th>
          <th>Fecha de Cierre</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;

  const tbody = contenedor.querySelector("tbody");

  lista.forEach(item => {
    const estadoCod = item.CodigoEstado || "-";
    const estado = item.Estado || estadosTexto[estadoCod] || "Desconocido";
    const fechaCierre = item.FechaCierre ? new Date(item.FechaCierre).toLocaleDateString("es-CL") : "-";

    const fila = `
      <tr>
        <td>${item.Nombre || item.NombreLicitacion}</td>
        <td>${item.CodigoExterno || item.CodigoLicitacion}</td>
        <td>${estado}</td>
        <td>${fechaCierre}</td>
      </tr>
    `;
    tbody.insertAdjacentHTML("beforeend", fila);
  });

  $("#tablaLicitaciones").DataTable({
    language: {
      url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-CL.json'
    }
  });
}

function mostrarError(msg) {
  document.getElementById('contenedor-licitaciones').innerHTML = `<p class="text-danger">${msg}</p>`;
}
