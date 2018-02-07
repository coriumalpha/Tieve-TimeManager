var tipos = {
	entrada: 1,
	salida: 0
}

var literales = {
	tipos : {
		0: '<i class="fas fa-fw fa-stop mr-1 ml-1"></i>',
		1: '<i class="fas fa-fw fa-play mr-1 ml-1"></i>',
	},
	codigos: {
		0: '<i class="fas fa-fw fa-briefcase"></i>',
		3: '<i class="fas fa-fw fa-coffee"></i>',
		6: '<i class="fas fa-fw fa-cloud"></i>',
		7: '<i class="fas fa-fw fa-utensils"></i>',
	}
}

var codigosLabel = {
	0: "light",
	3: "danger",
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
    var h = Math.floor(s/3600); //Obtener horas enteras
    s -= h*3600;
    var m = Math.floor(s/60); //Obtener minutos enteros
    s -= m*60;
    return h+":"+(m < 10 ? '0'+m : m)+":"+(s < 10 ? '0'+s : s); //Añadir cero precedente a minutos y segundos
}
