const STORAGE_KEY = 'aurea-air-reservas';

// Selectores del formulario de reservas.
const pasajeroInput = document.querySelector('#pasajero');
const origenInput = document.querySelector('#origen');
const destinoInput = document.querySelector('#destino');
const telefonoInput = document.querySelector('#telefono');
const fechaInput = document.querySelector('#fecha');
const horaInput = document.querySelector('#hora');
const notasInput = document.querySelector('#notas');
const formulario = document.querySelector('#nueva-reserva');
const contenedorReservas = document.querySelector('#reservas');
let editar;

class Reservas {
    constructor() {
        this.reservas = this.cargar();
    }

    cargar() {
        try {
            const reservasGuardadas = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return Array.isArray(reservasGuardadas) ? reservasGuardadas : [];
        } catch {
            return [];
        }
    }

    guardar() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.reservas));
        } catch {
            return false;
        }
        return true;
    }

    agregarReserva(reserva) {
        this.reservas = [...this.reservas, reserva];
        this.guardar();
    }

    eliminarReserva(id) {
        this.reservas = this.reservas.filter(reserva => reserva.id !== id);
        this.guardar();
    }

    editarReserva(reservaActualizada) {
        this.reservas = this.reservas.map(reserva => reserva.id === reservaActualizada.id ? reservaActualizada : reserva);
        this.guardar();
    }
}

class UI {
    crearDato(etiqueta, valor) {
        const parrafo = document.createElement('p');
        const etiquetaElemento = document.createElement('span');
        etiquetaElemento.classList.add('font-weight-bolder');
        etiquetaElemento.textContent = `${etiqueta}:`;
        parrafo.append(etiquetaElemento, document.createTextNode(` ${valor}`));
        return parrafo;
    }

    mostrarToast(mensaje, tipo = 'success') {
        const toast = document.createElement('div');
        toast.classList.add('toast-reserva', `toast-${tipo}`);
        toast.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
        toast.textContent = mensaje;
        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('toast-visible'));
        setTimeout(() => {
            toast.classList.remove('toast-visible');
            setTimeout(() => toast.remove(), 250);
        }, 4200);
    }

    imprimirReservas({reservas}) {
        this.limpiarHTML();

        reservas.forEach(reserva => {
            const {pasajero, origen, destino, telefono, fecha, hora, notas, id} = reserva;
            const divReserva = document.createElement('div');
            divReserva.classList.add('list-group-item', 'p-4', 'mb-3');
            divReserva.dataset.id = id;

            const pasajeroParrafo = document.createElement('h4');
            pasajeroParrafo.classList.add('card-title', 'font-weight-bolder', 'text-primary');
            pasajeroParrafo.textContent = pasajero;

            const rutaParrafo = this.crearDato('Ruta', `${origen} -> ${destino}`);
            const telefonoParrafo = this.crearDato('Teléfono', telefono);
            const fechaParrafo = this.crearDato('Fecha de Vuelo', fecha);
            const horaParrafo = this.crearDato('Hora de Salida', hora);
            const notasParrafo = this.crearDato('Notas/Asiento', notas);

            const btnEliminar = document.createElement('button');
            btnEliminar.classList.add('btn', 'btn-danger', 'me-2');
            btnEliminar.innerHTML = 'Eliminar <svg style="width:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
            btnEliminar.onclick = () => eliminaReserva(id);

            const btnEditar = document.createElement('button');
            btnEditar.classList.add('btn', 'btn-info', 'text-white');
            btnEditar.innerHTML = 'Editar <svg style="width:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>';
            btnEditar.onclick = () => cargarEdicion(reserva);

            divReserva.appendChild(pasajeroParrafo);
            divReserva.appendChild(rutaParrafo);
            divReserva.appendChild(telefonoParrafo);
            divReserva.appendChild(fechaParrafo);
            divReserva.appendChild(horaParrafo);
            divReserva.appendChild(notasParrafo);
            divReserva.appendChild(btnEliminar);
            divReserva.appendChild(btnEditar);

            contenedorReservas.appendChild(divReserva);
        });
    }
    
    limpiarHTML() {
        while(contenedorReservas.firstChild) {
            contenedorReservas.removeChild(contenedorReservas.firstChild);
        }
    }
}

const administraReservas = new Reservas();
const useri = new UI();
useri.imprimirReservas(administraReservas);

eventListeners();
function eventListeners() {
    [pasajeroInput, origenInput, destinoInput, telefonoInput, notasInput].forEach(input => {
        prepararContador(input);
        input.addEventListener('input', datosReserva);
    });
    [fechaInput, horaInput].forEach(input => input.addEventListener('input', datosReserva));
    formulario.addEventListener('submit', nuevaReserva);
}

function prepararContador(input) {
    const contador = document.createElement('small');
    contador.className = 'contador-caracteres';
    contador.setAttribute('aria-live', 'polite');
    input.parentElement.appendChild(contador);
    actualizarContador(input, contador);
    input.addEventListener('input', () => actualizarContador(input, contador));
}

function actualizarContador(input, contador) {
    const maximo = input.hasAttribute('maxlength') ? Number(input.maxLength) : 0;
    if (!maximo) {
        return;
    }
    if (input.value.length > maximo) {
        input.value = input.value.slice(0, maximo);
    }
    contador.textContent = `${input.value.length} / ${maximo}`;
    contador.classList.toggle('contador-cerca', input.value.length >= maximo * 0.9);
}

const reservaObj = {
    pasajero: '',
    origen: '',
    destino: '',
    telefono: '',
    fecha: '',
    hora: '',
    notas: ''
};

function datosReserva(e) {
    const maximo = e.target.hasAttribute('maxlength') ? Number(e.target.maxLength) : 0;
    if (maximo && e.target.value.length > maximo) {
        e.target.value = e.target.value.slice(0, maximo);
    }
    reservaObj[e.target.name] = e.target.value;
}

function fechaLocal(fecha) {
    const [anio, mes, dia] = fecha.split('-').map(Number);
    return new Date(anio, mes - 1, dia);
}

function validarReserva(datos) {
    const errores = [];
    const nombreValido = /^[\p{L}][\p{L}\s.'-]*$/u;
    const ciudadValida = /^[\p{L}][\p{L}\s.'-]*$/u;
    const telefonoValido = /^\+?[\d\s()-]{7,16}$/;

    if (!datos.pasajero || datos.pasajero.length < 2 || datos.pasajero.length > 60 || !nombreValido.test(datos.pasajero)) {
        errores.push('Escribe un nombre de pasajero válido.');
    }
    if (!datos.origen || datos.origen.length < 2 || datos.origen.length > 60 || !ciudadValida.test(datos.origen)) {
        errores.push('Indica una ciudad de origen válida.');
    }
    if (!datos.destino || datos.destino.length < 2 || datos.destino.length > 60 || !ciudadValida.test(datos.destino)) {
        errores.push('Indica una ciudad de destino válida.');
    }
    if (datos.origen.toLocaleLowerCase() === datos.destino.toLocaleLowerCase()) {
        errores.push('El origen y el destino deben ser diferentes.');
    }
    if (!telefonoValido.test(datos.telefono) || datos.telefono.replace(/\D/g, '').length < 7) {
        errores.push('Escribe un teléfono válido.');
    }
    if (!datos.fecha) {
        errores.push('Selecciona una fecha de vuelo.');
    } else {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaVuelo = fechaLocal(datos.fecha);
        if (Number.isNaN(fechaVuelo.getTime()) || fechaVuelo < hoy) {
            errores.push('La fecha de vuelo no puede estar en el pasado.');
        } else if (fechaVuelo.getTime() === hoy.getTime()) {
            const [hora, minutos] = datos.hora.split(':').map(Number);
            const salida = new Date();
            salida.setHours(hora, minutos, 0, 0);
            if (!datos.hora || salida <= new Date()) {
                errores.push('Para hoy, elige una hora futura.');
            }
        }
    }
    if (!datos.hora || !/^([01]\d|2[0-3]):[0-5]\d$/.test(datos.hora)) {
        errores.push('Selecciona una hora de salida válida.');
    }
    if (!datos.notas || datos.notas.length < 3 || datos.notas.length > 300) {
        errores.push('Añade una nota o preferencia de al menos 3 caracteres.');
    }

    return errores;
}

function nuevaReserva(e) {
    e.preventDefault();

    Object.keys(reservaObj).forEach(campo => {
        if (typeof reservaObj[campo] === 'string') {
            reservaObj[campo] = reservaObj[campo].trim();
        }
    });
    const errores = validarReserva(reservaObj);
    if (errores.length) {
        useri.mostrarToast(errores[0], 'error');
        return;
    }

    if(editar) {
        administraReservas.editarReserva({...reservaObj});

        formulario.querySelector('button[type="submit"]').textContent = 'Reservar Vuelo';

        editar = false;
        useri.mostrarToast('Reserva actualizada correctamente');
    } else { 
        reservaObj.id = Date.now();

        administraReservas.agregarReserva({...reservaObj});

        useri.mostrarToast('La reserva de vuelo se creó correctamente');
    }

    formulario.reset();
    reiniciarObjeto();
    useri.imprimirReservas(administraReservas);
}

function reiniciarObjeto() {
    delete reservaObj.id;
    reservaObj.pasajero = '';
    reservaObj.origen = '';
    reservaObj.destino = '';
    reservaObj.telefono = '';
    reservaObj.fecha = '';
    reservaObj.hora = '';
    reservaObj.notas = '';
}

function eliminaReserva(id) {
    administraReservas.eliminarReserva(id);

    useri.mostrarToast('La reserva se eliminó correctamente');

    useri.imprimirReservas(administraReservas);
}

function cargarEdicion(reserva) {
    const {pasajero, origen, destino, telefono, fecha, hora, notas, id} = reserva;

    pasajeroInput.value = pasajero;
    origenInput.value = origen;
    destinoInput.value = destino;
    telefonoInput.value = telefono;
    fechaInput.value = fecha;
    horaInput.value = hora;
    notasInput.value = notas;
    [pasajeroInput, origenInput, destinoInput, telefonoInput, notasInput].forEach(input => {
        const contador = input.parentElement.querySelector('.contador-caracteres');
        if (contador) {
            actualizarContador(input, contador);
        }
    });

    reservaObj.pasajero = pasajero;
    reservaObj.origen = origen;
    reservaObj.destino = destino;
    reservaObj.telefono = telefono;
    reservaObj.fecha = fecha;
    reservaObj.hora = hora;
    reservaObj.notas = notas;
    reservaObj.id = id;

    formulario.querySelector('button[type="submit"]').textContent = 'Guardar Cambios';
    editar = true;
}
