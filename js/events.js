$("#btnAhora").on('click', function(event) {
	$("#datetimeInput").datetimepicker('setDate', (new Date()));
});

$("#btnRestar").on('click', function(event) {
	var f = $("#datetimeInput").datetimepicker('getDate');
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

$("#btnBulkInsert").on('click', function(event) {
	localStorage.clear();
	dParser($("#bulkInsert").val());
});

$("#btnFullWipe").on('click', function(event) {
	localStorage.clear();
	dias = [];
	registros = [];
	initTablaRegistros();
});
