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

var deleteBadge = function (listaIds) {
	var copiaRegistros = registros;
	
	$.each(listaIds, function(key, value) {
		copiaRegistros = $.grep(copiaRegistros, function(registro) {
			return registro.id !== parseInt(value);
		});
	});

	localStorage.setItem('registros', JSON.stringify(copiaRegistros));

	//TODO Arreglar esta basurilla
	registros.length = 0;
	dias.length = 0;

	//TODO: Habiendo identificado el badge, es más eficiente eliminarlo de la tabla y actualizar un único registro a recalcular la tabla entera
	$.when(initTablaRegistros()).done(drawFromLocal());
}

var drawFromLocal = function () {
    var logs = JSON.parse(localStorage.getItem('registros'))
    $.each(logs, function (key, value) {
    	//Revivir la fecha, viene en texto plano
        value.fecha = new Date(value.fecha);
        addNewRegistro(value);
    });
}

//Relativamente optimizada
var addNewRegistro = function (registro) {
    var idDia;
    var dia;

    if (registros.length == 0) {
    	registro.id = 1;
    } else {
    	registro.id = registros.length + 1;
    }

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

	//TODO: Supuestamente arregla problemas de rendimiento
    $.each(registrosEntrada, function (key, entrada) {	
		var minDuration;
    	var salida;

    	var horaEntrada = moment(entrada.fecha).format("HH:mm:ss");
        var horaEntradaCorta = moment(entrada.fecha).format("HH:mm");

    	$.each(registros, function(k, value) {
    		if (value.codigo === entrada.codigo && value.tipo === tipos.salida && (getDateDiff(entrada.fecha, value.fecha) > 0)) {
    			var posibleSalida = value;

    			var dateDiff = getDateDiff(entrada.fecha, posibleSalida.fecha);

    			if (typeof (minDuration) === "undefined") {
                    minDuration = dateDiff;
                    salida = posibleSalida;
                } else if (dateDiff < minDuration) {
                	minDuration = dateDiff;
                    salida = posibleSalida;
                }
    		}
    	})

    	if (typeof salida === "undefined") {
    		//Sólo hay entrada, badge de entrar!
            var badge = {
        		claseCodigo: codigosLabel[entrada.codigo],
        		entrada: entrada.fecha,
        		idEntrada: entrada.id,
        	}
        	badges += conformarBadge(badge);
    	} else {
    		var duracionSec = getDateDiff(entrada.fecha, salida.fecha);
	        var duracion = secondsTimeSpanToHMS(duracionSec);
	        //Ir incrementando diferencia del día según van entrando nuevos registros, basándose en el código
	        events.diferencia += calculateEventDifference(entrada.codigo, duracionSec, entrada.fecha);

	        var badge = {
	    		claseCodigo: codigosLabel[entrada.codigo],
	    		duracion: duracion,
	    		entrada: entrada.fecha,
	    		salida: salida.fecha,
	    		idEntrada: entrada.id,
	    		idSalida: salida.id,
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
	//Los registros no tienen por qué llegar ordenados desde la función que llama
    var f = moment(dia.fecha);
    dia.eventos = {};
    dia.eventos = calculateEvents(dia.registros);
    var diferenciaPuntual = secondsTimeSpanToHMS(dia.eventos.diferencia * (-1));

    var diferenciaTotal = 0;
    var diferenciaHistorica = 0;
	dia.diferenciaAcumulativa = 0;

	//Procuramos realizar el ordenamiento de registros del día una única vez
	dia.registros.sort(function(a, b) {
    	var dateA = new Date(a.fecha);
    	var dateB = new Date(b.fecha);
    	return dateA - dateB;
	});

	//Obtenemos la diferencia acumulada hasta el día de hoy utilizando la almacenada en el día previo más próximo
	//después se le irá sumando la diferencia del día actual. Después.
    var diasPrevios = $.grep(dias, function(value, key) {
    	var fecha = new Date(value.fecha);
    	var diaActual = new Date(dia.fecha);
    	return fecha < diaActual;
    });

    if (diasPrevios.length > 0) {
	    diasPrevios = diasPrevios.sort(function(a, b) {
	    	var dateA = new Date(a.fecha);
	    	var dateB = new Date(b.fecha);
	    	return dateA - dateB;
	    });
	    diferenciaHistorica = diasPrevios[diasPrevios.length - 1].diferenciaAcumulativa;  	
    }

    dia.diferenciaAcumulativa = diferenciaHistorica + dia.eventos.diferencia;
    diferenciaTotal = secondsTimeSpanToHMS(dia.diferenciaAcumulativa * (-1));

	var primeraEntrada;
	$.each(dia.registros, function(key, value) {
		if (value.tipo === tipos.entrada) {
			primeraEntrada = value;
		}
	});
	
	var salidaEstimada = 0;
	
	if (typeof primeraEntrada !== "undefined") {
		var dow = new Date(primeraEntrada.fecha).getDay();
		var duracionJornada = (dow == 5) ? tiempos.jornada.intensiva : (tiempos.jornada.normal + tiempos.eventos[7]);
		var compensacion = (dia.diferenciaAcumulativa < (15 * 60)) ? ((dia.diferenciaAcumulativa < (5 * 60)) ? 0 : 5) : 15;
		var salidaEstimada = moment(primeraEntrada.fecha).add((duracionJornada * 60) + dia.eventos.diferencia + (compensacion * 60), 'seconds').format("HH:mm")
	}

    var tableRow = {
        id: dia.id,
        dia: f.format('YYYY-MM-DD'),
        eventos: dia.eventos.badges,
        acumulativo: conformarBadge({
        	tiempoTotal: diferenciaTotal,
        	tiempoParcial: diferenciaPuntual,
        	salidaEstimada: salidaEstimada,
        	acumulativo: true,
        }),
    }

    if (method === "insert") {
        var row = tablaRegistros.row.add(tableRow).draw();
    } else {
        tablaRegistros.row(dia.id).data(tableRow).draw();
    }

    //TODO: Arreglar esta guarrada, por el amor de Diorr
    $("#tablaRegistros .editableItem").unbind().click(function (event) {
		var target = event.target.closest(".editableItem")
		
		var listaIds = [];

		listaIds.push($(target).attr('identrada'));
		if ($(target).attr('idsalida') !== "undefined") {
			listaIds.push($(target).attr('idsalida'));
		}
		if (confirm('Se va a eliminar una entrada')) {
			deleteBadge(listaIds);	
		}
	});
}

var initTablaRegistros = function () {
	var dfd = jQuery.Deferred();

	if ($.fn.DataTable.isDataTable('#tablaRegistros')) {
            $('#tablaRegistros').DataTable().clear().destroy();
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
        ],
        fnInitComplete: function(oSettings, json) {
	     	dfd.resolve();
	    }
    }
    tablaRegistros = $("#tablaRegistros").DataTable(tableConfig);

    return dfd.promise();
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
