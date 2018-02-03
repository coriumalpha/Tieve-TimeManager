var tablaRegistros;
var registros = [];
var dias = [];

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

var calculateEventsOld = function(registros) {
	var events = {};
	var badges = "";

	var codeOne = $.grep(registros, function(value) {
		return value.codigo === "1"
	});

	if (codeOne.length == 2) {
		var entrada = $.grep(codeOne, function(value) {
			return value.tipo == tipos.entrada;
		});
		var salida = $.grep(codeOne, function(value) {
			return value.tipo == tipos.salida;
		});

		var duracion = getDateDiff(entrada[0].fecha, salida[0].fecha);
		badges += '<span class="badge badge-secondary">' + duracion + '</span>'
	} else {
		$.each(registros, function(key, value) {
			var hora = moment(value.fecha).format("HH:mm:ss");
			badges += '<span class="badge badge-secondary">' + literales.tipos[value.tipo] + ' ' + hora + '</span>'
		});
	}

	events.badges = badges;
	return events;
}

var calculateEvents = function(registros) {
	var events = {};
	var badges = "";

	var registrosEntrada = $.grep(registros, function(value) {
		return value.tipo === tipos.entrada;
	});

	$.each(registrosEntrada, function(key, entrada) {
		var posiblesSalidas = $.grep(registros, function(value) {
			return value.codigo === entrada.codigo && value.tipo === tipos.salida;
		});

		if (posiblesSalidas.length == 0) {
			//Sólo hay entrada, badge de entrar!
			var horaEntrada = moment(entrada.fecha).format("HH:mm:ss");
			badges += '<span class="badge badge-secondary">' + literales.tipos[entrada.tipo] + ' (' + entrada.codigo + ') ' + horaEntrada + '</span>'
		} else if (posiblesSalidas.length == 1) {
			//Calcular diferencias y badge de entrada-salida
			var duracion = getDateDiff(entrada.fecha, posiblesSalidas[0].fecha);
			var horaEntrada = secondsTimeSpanToHMS(duracion);
			badges += '<span class="badge badge-secondary">' + ' (' + entrada.codigo + ') ' + horaEntrada + '</span>'
		} else {
			//Encontrar el más cercano y hacer badge de entrada-salida con él
			var minDuration;
			var salida;

			$.each(posiblesSalidas, function(key, posibleSalida) {
				if (typeof(minDuration) === "undefined") {
					minDuration = getDateDiff(posibleSalida.fecha, entrada.fecha);
					salida = posibleSalida;
					return				
				}
				var dateDiff = getDateDiff(posibleSalida.fecha, entrada.fecha);
				if (dateDiff < minDuration)
				{
					minDuration = dateDiff;
					salida = posibleSalida;
				} 
			});

			var duracion = getDateDiff(entrada.fecha, salida.fecha);
			var horaEntrada = secondsTimeSpanToHMS(duracion);
			badges += '<span class="badge badge-secondary">' + ' (' + entrada.codigo + ') ' + horaEntrada + '</span>'
		}
	});

	events.badges = badges;
	return events;
}

var drawDia = function(dia, method) {
	var f = moment(dia.fecha);
	var events = calculateEvents(dia.registros);

	var tableRow = {
		id: dia.id,
		dia: f.format('DD [de] MMMM'),
		eventos: events.badges,
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