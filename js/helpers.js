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
    var horaEntrada = moment(data.entrada).format("HH:mm:ss");
    var horaEntradaCorta = moment(data.entrada).format("HH:mm");


	//var clases = 'd-flex justify-content-around badge badge-' + data.claseCodigo + ' w-100 my-1';
    var clases = 'badge badge-' + data.claseCodigo + ' w-100 my-1';
    if (typeof data.salida !== "undefined") {
		var horaSalida = moment(data.salida).format("HH:mm:ss");
	    var horaSalidaCorta = moment(data.salida).format("HH:mm");
    	var title = 'De ' + horaEntrada + ' a ' + horaSalida;
    } else {
    	var title = 'Entrada: ' + horaEntrada;
    }
	

	var badge = '<span class="' + clases + '" title="' + title + '">';
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