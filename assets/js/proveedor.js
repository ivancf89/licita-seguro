const API_KEY = 'AC3A098B-4CD0-41AF-81A5-41284248419B';
const API_URL_BASE = 'https://api.mercadopublico.cl/servicios/v1/Publico/Empresas/BuscarProveedor';
const BACKUP_JSON = './assets/data/proveedor-fake.json';

document.getElementById('proveedor-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const rut = document.getElementById('rut').value.trim();

  if (!/^\d{2}\.\d{3}\.\d{3}-[\dkK]$/.test(rut)) {
    document.getElementById('resultado-proveedor').innerHTML = `
      <p class="text-danger">❌ Formato de RUT inválido. Usa el formato 12.345.678-9</p>`;
    return;
  }

  // mensaje de carga
  document.getElementById('resultado-proveedor').innerHTML = `
    <div class="text-info">🔍 Buscando proveedor...</div>`;

  const url = `${API_URL_BASE}?rutempresaproveedor=${rut}&ticket=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("API no responde");

    const data = await res.json();
    mostrarProveedor(data, rut);
  } catch (err) {
    console.warn("Fallo la API oficial, usando respaldo local...");
    usarRespaldo(rut);
  }
});

// Si la API falla, usa un JSON de respaldo
async function usarRespaldo(rut) {
  try {
    const res = await fetch(BACKUP_JSON);
    const data = await res.json();
    mostrarProveedor(data, rut, true);
  } catch (err) {
    document.getElementById('resultado-proveedor').innerHTML = `
      <p class="text-danger">⚠️ No se pudo obtener datos del proveedor ni desde la API ni desde el respaldo.</p>`;
  }
}

// Mostrar los datos en pantalla
function mostrarProveedor(data, rut, esRespaldo = false) {
  const div = document.getElementById('resultado-proveedor');

  if (!data || !Array.isArray(data.listaEmpresas) || data.listaEmpresas.length === 0) {
    div.innerHTML = `<p class="text-warning">⚠️ No se encontraron datos para ese RUT o no está registrado públicamente.</p>`;
    return;
  }

  const empresa = data.listaEmpresas[0];

  div.innerHTML = `
    <div class="card border-${esRespaldo ? 'secondary' : 'success'}">
      <div class="card-body">
        <h5 class="card-title">${empresa.NombreEmpresa}</h5>
        <p class="card-text">
          <strong>Código Empresa:</strong> ${empresa.CodigoEmpresa}<br>
          <strong>RUT Consultado:</strong> ${rut}<br>
          <em>${esRespaldo ? 'Datos simulados desde respaldo local 🗂️' : 'Datos reales desde API oficial 🔗'}</em>
        </p>
      </div>
    </div>
  `;

  // Limpiar campo de RUT
  document.getElementById('rut').value = '';
}
