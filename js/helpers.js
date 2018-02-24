var tipos = {
	entrada: 1,
	salida: 0
}

var tiempos = {
	jornada: {
		normal: 510,
		intensiva: 411
	},
	eventos: {
		1: 15,
		6: 6,
		7: 30,
	}
}

var literales = {
	tipos : {
		0: '<i class="fas fa-fw fa-stop mr-1 ml-1"></i>',
		1: '<i class="fas fa-fw fa-play mr-1 ml-1"></i>',
	},
	codigos: {
		0: '<i class="fas fa-fw fa-briefcase"></i>',
		1: '<i class="fas fa-fw fa-coffee"></i>',
		6: '<i class="fas fa-fw fa-cloud"></i>',
		7: '<i class="fas fa-fw fa-utensils"></i>',
	}
}

var codigosLabel = {
	0: "light",
	1: "danger",
	6: "info",
	7: "success",
}

var getDateDiff = function(date1, date2) {
	var h1 = date1.getHours();
	var m1 = date1.getMinutes();
	var s1 = date1.getSeconds();
	var h2 = date2.getHours();
	var m2 = date2.getMinutes();
	var s2 = date2.getSeconds();

	var total1 = (h1 * 3600) + (m1 * 60) + s1;
	var total2 = (h2 * 3600) + (m2 * 60) + s2;

	var total = total2 - total1;
	return total
}

var secondsTimeSpanToHMS = function(s) {
	var negative = false;
	if (s < 0) {
		s = s * (-1);
		negative = true;
	}
    var h = Math.floor(s/3600); //Obtener horas enteras
    s -= h*3600;
    var m = Math.floor(s/60); //Obtener minutos enteros
    s -= m*60;
    return ((negative) ? '- ' : '') + ((h == 0) ? '' : h + "h ") + (m < 10 ? '0'+m : m) + "\' " + (s < 10 ? '0'+s : s) + '\"'; //Añadir cero precedente a minutos y segundos
}

var secondsTimeSpanToHM = function(s) {
	var negative = false;
	if (s < 0) {
		s = s * (-1);
		negative = true;
	}
    var h = Math.floor(s/3600); //Obtener horas enteras
    s -= h*3600;
    var m = Math.floor(s/60); //Obtener minutos enteros
    s -= m*60;
    return ((negative) ? '- ' : '') + h + ":" + (m < 10 ? '0'+m : m); //Añadir cero precedente a minutos y segundos
}

var conformarBadge = function(data) {
	if (typeof data.acumulativo !== "undefined") {

		var badge = '<span class="badge badge-dark w-100 my-1">';
		badge += 		'<div class="row">'
		badge += 			'<div class="col-sm-4 m-auto">';
		badge += 				'<span class="m-auto"><i class="fas fa-fw fa-clock ml-1"></i> ' + data.tiempoTotal + '</span>';
		badge += 			'</div>';
		badge += 			'<div class="col-sm-4 m-auto">';
		badge += 				'<span class="m-auto"><i class="fas fa-fw fa-history"></i> ' + data.tiempoParcial + '</span>';
		badge += 			'</div>';
		badge += 			'<div class="col-sm-4 m-auto">';
		badge += 				'<span class="m-auto"><i class="fas fa-fw fa-sign-out-alt"></i> ' + data.salidaEstimada + '</span>';
		badge += 			'</div>';
		badge += 		'</div>';
		badge += '</span>';

		return badge;
	}

    var horaEntrada = moment(data.entrada).format("HH:mm:ss");
    var horaEntradaCorta = moment(data.entrada).format("HH:mm");


	//var clases = 'd-flex justify-content-around badge badge-' + data.claseCodigo + ' w-100 my-1';
    var clases = 'badge badge-' + data.claseCodigo + ' w-100 my-1 editableItem';
    if (typeof data.salida !== "undefined") {
		var horaSalida = moment(data.salida).format("HH:mm:ss");
	    var horaSalidaCorta = moment(data.salida).format("HH:mm");
    	var title = 'De ' + horaEntrada + ' a ' + horaSalida;
    } else {
    	var title = 'Entrada: ' + horaEntrada;
    }

    //Parece ser que los parámetros de HTML no son case-sensitive
    var identifierParameters =  (typeof data.idSalida === "undefined") ? 'identrada="' + data.idEntrada + '"' : 'identrada="' + data.idEntrada + '" idsalida="' + data.idSalida + '"';

	var badge = '<span class="' + clases + '" title="' + title + '" '+ identifierParameters +'>';
	badge += 		'<div class="row">'
	badge += 			'<div class="col-sm-4 m-auto">';
	badge += 				(typeof data.salida !== "undefined") ? '<span class="m-auto"><i class="fas fa-fw fa-stopwatch ml-1"></i> ' + data.duracion + '</span>' : '';
	badge += 			'</div>';
	badge += 			'<div class="col-sm-4 m-auto">';
	badge += 				'<span class="m-auto"><i class="fas fa-fw fa-play"></i> ' + horaEntradaCorta + '</span>';
	badge += 			'</div>';
	badge += 			'<div class="col-sm-4 m-auto">';
	badge += 				(typeof data.salida !== "undefined") ? '<span class="m-auto"><i class="fas fa-fw fa-stop"></i> ' + horaSalidaCorta + '</span>' : '';
	badge += 			'</div>';
	badge += 		'</div>';
	badge += '</span>';

	return badge;
}

var hParser = function (entry, fecha) {
    var evento = {};
    
    evento.tipo = (entry.substring(0, 1) == "E" || entry.substring(0, 1) == "i") ? tipos.entrada : tipos.salida;

    var fechaEvento = new Date(fecha);
    fechaEvento.setHours(entry.substring(2, 4));
    fechaEvento.setMinutes(entry.substring(5, 7));
    fechaEvento.setSeconds(entry.substring(8, 10));
    evento.codigo = entry.substring(13);

    evento.fecha = fechaEvento;
    return evento;
}

var dParser = function (rawEntries) {
    var entries = rawEntries.split('\n');

    var dayEntries = [];
    var d;

    $.each(entries, function (key, value) {
        value = value.trim();
        var protoDate = value.split("/");
        if (protoDate.length == 3) {
            d = new Date(protoDate[2], protoDate[1] - 1, protoDate[0]);
        } else {
            dayEntries.push(hParser(value, d));
        }
    });

    $.each(dayEntries, function (key, value) {
        addNewRegistro(value);
    })
    
    return
}