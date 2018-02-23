var tablaRegistros;
var registros = [];
var dias = [];

//Llamadas a funciones tras carga del documento web
$(function () {
    moment().locale('es');
    initTimePicker();
    initTablaRegistros();
    drawFromLocal();
});

var drawFromLocal = function () {
    var logs = JSON.parse(localStorage.getItem('registros'))
    $.each(logs, function (key, value) {
    	//Revivir la fecha, viene en texto plano
        value.fecha = new Date(value.fecha);
        addNewRegistro(value);
    });
}

var addNewRegistro = function (registro) {
    var idDia;
    var dia;

    registros.push(registro);
    //Ordenar registros
    registros.sort(function(a, b) {
    	var dateA = new Date(a.fecha);
    	var dateB = new Date(b.fecha);
    	return dateA - dateB;
    });
    localStorage.setItem('registros', JSON.stringify(registros))

    $.each(dias, function (key, value) {
        //Colocamos las horas a cero para excluir el tiempo de la comparación
        var rf = new Date(registro.fecha);
        if (value.fecha.valueOf() === rf.setHours(0, 0, 0, 0).valueOf()) {
            //El día existe en dias[] por lo que extraemos su id
            idDia = value.id;
            return;
        }
    });

    if (typeof (idDia) === "undefined") {
        //El día no existía, por lo que creamos uno nuevo
        var rf = new Date(registro.fecha)
        dia = {
            id: dias.length,
            fecha: rf.setHours(0, 0, 0, 0),
            registros: []
        }
        dia.registros.push(registro);
        dias.push(dia);
        drawDia(dia, "insert");
    } else {
        dias[idDia].registros.push(registro);
        dias[idDia].registros.sort(function(a, b) {
	    	var dateA = new Date(a.fecha);
	    	var dateB = new Date(b.fecha);
	    	return dateA - dateB;
    	});
        drawDia(dias[idDia], "update");
    }
}

var calculateEvents = function (registros) {
    var events = {};
    //Almacenará la diferencia en segundos (en negativo si se debe tiempo)
    events.diferencia = 0;
    var badges = "";

    var registrosEntrada = $.grep(registros, function (value) {
        return value.tipo === tipos.entrada;
    });

    $.each(registrosEntrada, function (key, entrada) {
        var posiblesSalidas = $.grep(registros, function (value) {
            return value.codigo === entrada.codigo && value.tipo === tipos.salida && (getDateDiff(entrada.fecha, value.fecha) > 0);
        });

        var horaEntrada = moment(entrada.fecha).format("HH:mm:ss");
        var horaEntradaCorta = moment(entrada.fecha).format("HH:mm");

        if (posiblesSalidas.length == 0) {
            //Sólo hay entrada, badge de entrar!
            var badge = {
        		claseCodigo: codigosLabel[entrada.codigo],
        		entrada: entrada.fecha,
        	}
        	badges += conformarBadge(badge);
        } else {
            //Encontrar el más cercano y hacer badge de entrada-salida con él
            var minDuration;
            var salida;

            $.each(posiblesSalidas, function (key, posibleSalida) {
                if (typeof (minDuration) === "undefined") {
                    minDuration = getDateDiff(entrada.fecha, posibleSalida.fecha);
                    salida = posibleSalida;
                    return
                }
                var dateDiff = getDateDiff(entrada.fecha, posibleSalida.fecha);
                if (dateDiff < minDuration) {
                    minDuration = dateDiff;
                    salida = posibleSalida;
                }
            });

            var duracionSec = getDateDiff(entrada.fecha, salida.fecha);
            var duracion = secondsTimeSpanToHMS(duracionSec);
            //Ir incrementando diferencia del día según van entrando nuevos registros, basándose en el código
            events.diferencia += calculateEventDifference(entrada.codigo, duracionSec, entrada.fecha);

            var badge = {
        		claseCodigo: codigosLabel[entrada.codigo],
        		duracion: duracion,
        		entrada: entrada.fecha,
        		salida: salida.fecha,
        	}
        	badges += conformarBadge(badge);
        }
    });

    events.badges = badges;
    return events;
}

var calculateEventDifference = function (codigo, duracion, fecha) {
	var diferencia;
	var dow = new Date(fecha).getDay();

	switch(codigo) {
		case "0": 
			if (dow == 5) {
				diferencia = (tiempos.jornada.intensiva * 60) - duracion;
				break;
			}
			diferencia = (tiempos.jornada.normal * 60) - duracion;
			break;
		case "1":
			if (duracion <= (tiempos.eventos[codigo] * 60)) {
				diferencia = 0;
			} else {
				diferencia = duracion - (tiempos.eventos[codigo] * 60); 
			}
			break;
		case "6":
			diferencia = duracion;
			break;
		case "7":
			if (duracion <= (tiempos.eventos[codigo] * 60)) {
				diferencia = (tiempos.eventos[codigo] * 60);
			} else {
				diferencia = duracion;
			}
			break;
	}

	return diferencia;
}

var drawDia = function (dia, method) {
    var f = moment(dia.fecha);
    dia.eventos = {};
    dia.eventos = calculateEvents(dia.registros);
    var diferenciaPuntual = secondsTimeSpanToHMS(dia.eventos.diferencia * (-1));
		
    var diasPrevios = $.grep(dias, function(value, key) {
    	var fecha = new Date(value.fecha);
    	var diaActual = new Date(dia.fecha);
    	return fecha < diaActual;
    });
    var diferenciaTotal = 0;
	var diferenciaTotalSegundos = 0;

    $.each(diasPrevios, function(key, value) {
    	diferenciaTotalSegundos += value.eventos.diferencia;
    });

    diferenciaTotal = secondsTimeSpanToHMS((diferenciaTotalSegundos + dia.eventos.diferencia) * (-1));

	dia.registros.sort(function(a, b) {
    	var dateA = new Date(a.fecha);
    	var dateB = new Date(b.fecha);
    	return dateA - dateB;
    });
	
	var entradasDia = $.grep(dia.registros, function(value) {
		return value.tipo === tipos.entrada;
	});
	
	var salidaEstimada = 0;
	
	if (entradasDia.length > 0) {
		var primeraEntrada = entradasDia[0];
		var dow = new Date(primeraEntrada.fecha).getDay();
		var duracionJornada = (dow == 5) ? tiempos.jornada.intensiva : (tiempos.jornada.normal + tiempos.eventos[7]);
		var compensacion = (diferenciaTotalSegundos < (15 * 60)) ? ((diferenciaTotalSegundos < (5 * 60)) ? 0 : 5) : 15;
		var salidaEstimada = moment(primeraEntrada.fecha).add((duracionJornada * 60) + dia.eventos.diferencia + (compensacion * 60), 'seconds').format("HH:mm")
	}
	
    var tableRow = {
        id: dia.id,
        dia: f.format('YYYY-MM-DD'),
        eventos: dia.eventos.badges,
        acumulativo: '<span class="badge badge-dark w-100" title="  "><i class="far fa-clock mr-1"></i> ' + diferenciaPuntual + ' <i class="fas fa-history mr-1 ml-1"></i>' + diferenciaTotal + ' <i class="fas fa-sign-out-alt mr-1 ml-1"></i>' + salidaEstimada + '</span>',
    }

    if (method === "insert") {
        var row = tablaRegistros.row.add(tableRow).draw();
    } else {
        tablaRegistros.row(dia.id).data(tableRow).draw();
    }
}

var initTablaRegistros = function () {
	if ($.fn.DataTable.isDataTable('#tablaRegistros')) {
            $('#tablaRegistros').DataTable().destroy();
        }
    var tableConfig = {
        rowId: 'id',
        searching: false,
        select: false,
        paging: false,
        info: false,
        order: [0, 'desc'],
        language: {
            emptyTable: "No hay registros que mostrar.",
        },
        columns: [
            { data: "dia" },
            { data: "eventos" },
            { data: "acumulativo" },
        ]
    }
    tablaRegistros = $("#tablaRegistros").DataTable(tableConfig);
}

//Establecimiento de configuración e inicialización del datepicker
//con fecha actual
var initTimePicker = function () {
    var timepickerConfig = {
        dateFormat: "dd-mm-yy",
        timeFormat: "HH:mm:ss"
    };
    $("#datetimeInput").datetimepicker(timepickerConfig);
    $("#datetimeInput").datetimepicker('setDate', (new Date()));
}
