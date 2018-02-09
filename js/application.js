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
        value.fecha = new Date(value.fecha);
        addNewRegistro(value);
    });
}

var addNewRegistro = function (registro) {
    var idDia;
    var dia;

    registros.push(registro);
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
    var badges = "";

    var registrosEntrada = $.grep(registros, function (value) {
        return value.tipo === tipos.entrada;
    });

    $.each(registrosEntrada, function (key, entrada) {
        var posiblesSalidas = $.grep(registros, function (value) {
            return value.codigo === entrada.codigo && value.tipo === tipos.salida && (getDateDiff(entrada.fecha, value.fecha) > 0);
        });

        if (posiblesSalidas.length == 0) {
            //Sólo hay entrada, badge de entrar!
            var horaEntrada = moment(entrada.fecha).format("HH:mm:ss");
            badges += '<span class="badge badge-' + codigosLabel[entrada.codigo] + ' w-100">' + literales.tipos[entrada.tipo] + ' ' + horaEntrada + '</span>'
        } else {
            //Encontrar el más cercano y hacer badge de entrada-salida con él
            var horaEntrada = moment(entrada.fecha).format("HH:mm:ss");
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
                console.log(minDuration);
            });

            var duracionSec = getDateDiff(entrada.fecha, salida.fecha);
            var duracion = secondsTimeSpanToHMS(duracionSec);
            var horaSalida = moment(salida.fecha).format("HH:mm:ss");
            badges += '<span class="badge badge-' + codigosLabel[entrada.codigo] + ' w-100">' + ' <i class="fas fa-fw fa-stopwatch ml-1"></i>' + ' ' + duracion + ' <i class="fas fa-fw fa-play"></i>' + ' ' + horaEntrada + ' <i class="fas fa-fw fa-stop"></i>' + ' ' + horaSalida + '</span>'
        }
    });

    events.badges = badges;
    return events;
}

var drawDia = function (dia, method) {
    var f = moment(dia.fecha);
    var events = calculateEvents(dia.registros);

    var tableRow = {
        id: dia.id,
        dia: f.format('DD [de] MMMM'),
        eventos: events.badges,
        acumulativo: '<span class="badge badge-dark w-100"><i class="far fa-clock mr-1"></i> 0:02:17 <i class="fas fa-history mr-1 ml-1"></i> 3:14:15</span>',
    }

    if (method === "insert") {
        var row = tablaRegistros.row.add(tableRow).draw();
    } else {
        tablaRegistros.row(dia.id).data(tableRow).draw();
    }
}

var initTablaRegistros = function () {
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