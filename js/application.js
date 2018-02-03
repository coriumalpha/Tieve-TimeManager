var tablaRegistros;
var registros = [];
var dias = [];

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

var addNewRegistro = function(registro) {
	var idDia;
	var dia;
	$.each(dias, function(key, value) {
		//Colocamos las horas a cero para excluir el tiempo de la comparación
		var rf = new Date(registro.fecha);
		if (value.fecha.valueOf() === rf.setHours(0,0,0,0).valueOf()) {
			//El día existe en dias[] por lo que extraemos su id
			idDia = value.id;
			return;
		}
	});

	if (typeof(idDia) === "undefined") {
		//El día no existía, por lo que creamos uno nuevo
		var rf = new Date(registro.fecha)
		dia = {
			id: dias.length,
			fecha: rf.setHours(0,0,0,0),
			registros: []
		}
		dia.registros.push(registro);

		dias.push(dia);
		drawDia(dia, "insert");
	} else {
		dias[idDia].registros.push(registro);
		drawDia(dias[idDia], "update");
	}
}

var drawDia = function(dia, method) {
	var badges = "";
	var f = moment(dia.fecha);

	$.each(dia.registros, function(key, value) {
		var hora = moment(value.fecha).format("HH:mm:ss");
		badges += '<span class="badge badge-secondary">' + literales.tipos[value.tipo] + ' ' + hora + '</span>'
	});

	var tableRow = {
		id: dia.id,
		dia: f.format('DD [de] MMMM'),
		eventos: badges,
		total: "08:30:00",
		acumulativo: "jijijouij",
	}

	if (method === "insert") {
		var row = tablaRegistros.row.add(tableRow).draw();
	} else {
		tablaRegistros.row(dia.id).data(tableRow).draw();
	}
}

var initTablaRegistros = function() {
	var tableConfig = {
		rowId: 'id',
		searching: false,
		select: false,
		paging: false,
		info: false,
		language: {
			emptyTable: "No hay registros que mostrar.",
		},
		columns: [
			{data: "dia"},
			{data: "eventos"},
			{data: "total"},
			{data: "acumulativo"},
		]
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
	addNewRegistro(registro);
});