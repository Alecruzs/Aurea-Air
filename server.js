// Sirve la interfaz estática de reservas de vuelos.
// Express expone src/ y permite abrir la aplicación desde un único origen local.
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.join(projectRoot, 'src');
const port = Number(process.env.PORT) || 4173;

app.disable('x-powered-by');

// Primero cargamos los recursos de src/ y luego los archivos de la raíz.
app.use(express.static(srcPath));
app.use(express.static(projectRoot));

// Ruta principal: devuelve la página inicial.
app.get('/', (req, res) => {
	res.sendFile(path.join(projectRoot, 'index.html'));
});

// Fallback para que las rutas de la interfaz devuelvan la página principal.
app.get(/^(?!\/api).*/, (req, res) => {
	res.sendFile(path.join(projectRoot, 'index.html'));
});

// Arrancamos el servidor en el puerto configurado.
app.listen(port, () => {
	console.log(`Aurea Air disponible en http://localhost:${port}`);
});