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