var tablaRegistros;
var registros = []

var tipos = {
	entrada: 1,
	salida: 0
}

var literales = {
	tipos : {
		0: "Salida",
		1: "Entrada",
	}
}

//Llamadas a funciones tras carga del documento web
$(function() {
	moment().locale('es');
	console.log('moment locale set to: ' + moment.locale());
	initTimePicker();
	initTablaRegistros();
});

var drawRegistro = function(registro) {
	var f = moment(registro.fecha);
	tablaRegistros.row.add([
		f.format('DD [de] MMMM'),
		f.format('HH:mm:ss'),
		registro.codigo,
		literales.tipos[registro.tipo]
	]).draw();
}

var initTablaRegistros = function() {
	var tableConfig = {
		searching: false,
		select: false,
		paging: false,
		info: false,
		language: {
			emptyTable: "No hay registros que mostrar.",
		}
	}			
	tablaRegistros = $("#tablaRegistros").DataTable(tableConfig);
}

//Establecimiento de configuración e inicialización del datepicker
//con fecha actual
var initTimePicker = function() {
	var timepickerConfig = {
		dateFormat: "dd-mm-yy",
		timeFormat: "HH:mm:ss"
	};
	$("#datetimeInput").datetimepicker(timepickerConfig);
	$("#datetimeInput").datetimepicker('setDate', (new Date()));
}

$("#btnHoy").on('click', function(event) {
	$("#datetimeInput").datetimepicker('setDate', (new Date()));
});

$("#btnAyer").on('click', function(event) {
	var f = new Date();
	f.setDate(f.getDate() - 1);
	$("#datetimeInput").datetimepicker('setDate', f);
});

$("#btnEntrada, #btnSalida").on('click', function(event) {
	registro = {
		fecha: $("#datetimeInput").datetimepicker('getDate'),
		codigo: $("#selectCode").val(),
		tipo: ((event.target.id === "btnEntrada") ? tipos.entrada : tipos.salida)
	}
	registros.push(registro);
	drawRegistro(registro);
});