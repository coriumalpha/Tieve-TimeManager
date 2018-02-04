$("#btnHoy").on('click', function(event) {
	$("#datetimeInput").datetimepicker('setDate', (new Date()));
});

$("#btnAyer").on('click', function(event) {
	var f = new Date();
	f.setDate(f.getDate() - 1);
	$("#datetimeInput").datetimepicker('setDate', f);
});

$("#btnInicio, #btnFin").on('click', function(event) {
	registro = {
		fecha: $("#datetimeInput").datetimepicker('getDate'),
		codigo: $('input[name=selectCode]:checked').val(),
		tipo: ((event.target.id === "btnInicio") ? tipos.entrada : tipos.salida)
	}
	addNewRegistro(registro);
});