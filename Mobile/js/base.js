/*!
 * Licensed under MIT (https://github.com/twbs/xxxxx/LICENSE)
 *//*! base.js v1.0 | MIT License | git.xxxxx */

var ajaxProcess = false;

var baseUrl = "http://api.transparencia.org.br:80/sandbox/v1/";

var _offset = 1;
var _limit = 5;
var outString = '';

// CANDIDATOS 
var candidatos = "candidatos"; 		                           //Retorna uma lista de candidatos.
var candidatos_id = "candidatos/{id}"; 	                       //Retorna um candidato específico, de acordo com o seu id
var candidatos_bens = "candidatos/{id}/bens";                  //Retorna a relação de bens declarados do candidato
var candidatos_doadores = "candidatos/{id}/doadores";          //Doações feitas para uma determinada campanha
var candidatos_candidaturas = "candidatos/{id}/candidaturas";  //Informações sobre candidaturas passadas do candidado
var candidatos_estatisticas = "candidatos/{id}/estatisticas";  //Informações estatísticas sobre os candidado

// PARTIDOS 
var partidos = "partidos";                                     //Retorna a lista de partidos políticos em atividade no Brasil

// ESTADOS 
var estados = "estados";                                       //Retorna a lista de estados brasileiros

// CARGOS 
var cargos = "cargos";                                         //Retorna a lista de todos os cargos a serem preenchidos em 2014

// EXCELENCIAS 
var excelencias = "excelencias";                               //Retorna uma lista de Excelências em exercício
var excelencias_id = "excelencias/{id}";                       //Retorna um parlamentar específico, de acordo com o seu 'id'
var excelencias_bens = "excelencias/{id}/bens";                //Retorna a relação de bens declarados do parlamenta


// ----------------------------------------------- CALL API METHODS

// CALL
function CallMethod(method, callBack) {

    try
    {
        if (!ajaxProcess)                                               
        {
            ajaxProcess = true;                                        

            ShowLoader(function () {
                $.ajax({ type: "GET",
                    url: baseUrl + method,
                    success: callBack,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    headers: { "App-Token": "C3p9RzwVcOoz" }
                });
                $(this).dequeue();
            });
        }
        else {
            //msg 
        }
    }
    catch (ex) {
        alert(ex);
    }
}

// LOADING...
function ShowLoader(pFunction) {
    if (pFunction == null) {
        $("div#modalLoading").fadeIn(300);
        waitDialog.hidePleaseWait();   
    }
    else {
        $("div#modalLoading").fadeIn().queue(pFunction);
        waitDialog.showPleaseWait();
    }

    ajaxProcess = false;
}

// ----------------------------------------------- DOCUMENT.READY 

$(document).ready(function () {

    SetStatePage(false);

    $("#btnBuscar").click(function () {
        searchCandidatos($('#lstPartidos').val(),
                         $('#lstEstados label[class="btn btnEstados btn-warning active"]').attr('value'),
                         $('#lstCargos label[class="btn btnCargos btn-warning active"]').attr('value')
        );
    });

    $("#btnVoltar").click(function () {
        SetStatePage(false);
        $('#lstCandidatos tbody').empty();
    });

    $("#btnMais").click(function () {
        _offset += 5;
        _limit = 5;

        searchCandidatos($('#lstPartidos').val(),
                         $('#lstEstados label[class="btn btnEstados btn-warning active"]').attr('value'),
                         $('#lstCargos label[class="btn btnCargos btn-warning active"]').attr('value')
        );
    });

    //Carrega dominios
    CallMethod(estados, push_Estados);
    CallMethod(partidos, push_Partidos);
    CallMethod(cargos, push_Cargos);

});

// ----------------------------------------------- SEARCH 

function searchCandidatos(partido, estado, cargo) {

    var params = '';

    if (cargo == '1') //Presidente + Estado
    {
        if (estado == undefined) //Default
            params = '?estado=SP&cargo=' + cargo;
        else
            params = '?estado=' + estado + '&cargo=' + cargo;
    }
    else {
        params = '?estado=' + estado + '&partido=' + partido + '&cargo=' + cargo;
    }

    CallMethod(candidatos + params + '&_offset=' + _offset + '&_limit=' + _limit, push_Candidatos);

    SetStatePage(true);
}

function searchDetalheCandidato(id) {
    $('#tblBens tbody').empty();
    $('#tblDoadores tbody').empty();
    $('#tblCandidaturas tbody').empty();
    $('.modal-dialog').empty();

    CallMethod(candidatos_id.replace('{id}', id), push_DetalheCandidato);
} 

function searchBens(id) {
    $('#tblBens tbody').empty();
    CallMethod(candidatos_bens.replace('{id}', id), push_Bens);
}

function searchDoadores(id) {
    $('#tblDoadores tbody').empty();
    CallMethod(candidatos_doadores.replace('{id}', id) + '?anoEleitoral=2010', push_Doadores);
}

function searchCandidaturas(id) {
    $('#tblCandidaturas tbody').empty();
    CallMethod(candidatos_candidaturas.replace('{id}', id), push_Candidaturas);
}

// ----------------------------------------------- PUSH

function push_Partidos(data) {

    outString = '<option value="">Partido (opcional)</option>';

    $('#lstPartidos').append(outString);

    $(data).each(function (index, item) {
        outString = '<option value="' + item.partidoId + '">' + item.sigla + '</option>';
        $('#lstPartidos').append(outString);
    });

    $('#lstPartidos').sort(this.value);
}

function push_Estados(data) {

    $('#lstEstados').empty();

    $(data).each(function (index, item) {
        if (item.sigla != 'BR') {
            outString = '<label class="btn btnEstados btn-warning" value="' + item.sigla + '" >' + item.sigla + '</label>';
            $('#lstEstados').append(outString);
        }
    });

    $('#lstEstados').sort(this.value);

}

function push_Cargos(data) {

    $('#lstCargos').empty();

    $(data).each(function (index, item) {

        if (item.nome.indexOf('Vice') == -1 && item.nome.indexOf('Distrital') == -1 && item.nome.indexOf('Suplente') == -1) {

            outString = '<label class="btn btnCargos btn-warning" value="' + item.cargoId + '" >' + item.nome + '</label>';

            $('#lstCargos').append(outString);
        }
    });

    $('#lstCargos').sort(this.value);

}

function push_Candidatos(data) {

    var reeleicao = '';
    var processos = '';
    var foto = '';
    
    //data = FilterSearchCandidatos(data);

    $(data).each(function (index, item) {

        if (item.reeleicao == true)
            reeleicao = ' <span class="label label-success">Reeleição</span> ';
        else
            reeleicao = ''

        if (item.processos != null)
            processos = ' <span class="label label-danger">Processo</span> ';
        else
            processos = '';

        if (item.foto.indexOf('250000003883.jpg') == -1)
            foto = item.foto;
        else
            foto = 'img/default2.png';

        outString = '<tr>';
        outString += '    <td><img src="' + foto + '" width="100px" class="img-rounded" /></td>';
        outString += '    <td>' + item.nome + reeleicao + processos + '<br /><b>Partido: </b>' + item.partido + ' <br /> <b>Estado: </b>' + item.estado + ' <br /> <b> Número: </b> ' + item.numero + ' <br /><button type="button" class="btn btn-info" data-toggle="modal" data-target="#myModalCandidato" id="' + item.id + '" onclick="searchDetalheCandidato(' + item.id + ');"><span class="glyphicon glyphicon-info-sign"></span> Detalhes</button></td>';
        outString += '    <td>';
        outString += '        <div class="progress">';
        outString += '            <div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%">100%</div>';
        outString += '        </div>';
        outString += '    </td>';
        outString += '    <td>';
        outString += '        <div>';
        outString += '            <div class="btn-group" data-toggle="buttons">';
        outString += '               <label class="btn btn-success btn-quiz">';
        outString += '                <input type="radio" name="optVotaria" value="S" id="' + item.id + '" onclick="SetVoto(this);"/>Sim</label>';
        outString += '            </div>';
        outString += '        </div>';
        outString += '    </td>';
        outString += '</tr>';

        $('#lstCandidatos tbody').append(outString);
    });

    if ($(data).length == 0 || $(data).length < _limit) {
        $("#btnMais").hide();
        _offset = 1;
        _limit = 5;
    }
    else {
        $("#btnMais").show();
    }
}

function push_DetalheCandidato(data) {

    $(data).each(function (index, item) {

        outString = '';

        outString += '<div class="modal-dialog">';
        outString += '    <div class="modal-content">';
        outString += '        <div class="modal-header">';
        outString += '            <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Fechar</span></button>';
        outString += '            <h3 class="modal-title" id="myModalLabel">' + item.nome + ', ' + item.idade + ' anos - ' + item.cargo + '</h3>';
        outString += '            <h5>' + ToString(item.minibio) + '</h5>';
        outString += '        </div>';
        outString += '        <div class="modal-body"><!-- modal-body -->';
        outString += '            <div class="panel-group" id="accordion">';
        outString += '                <div class="panel panel-default">';
        outString += '                    <div class="panel-heading">';
        outString += '                        <h4 class="panel-title">';
        outString += '                            <a data-toggle="collapse" data-parent="#accordion" href="#collapsePerfil">';
        outString += '                                Perfil';
        outString += '                            </a>';
        outString += '                        </h4>';
        outString += '                    </div>';
        outString += '                    <div id="collapsePerfil" class="panel-collapse collapse in">';
        outString += '                        <div class="panel-body">';
        outString += '                            <p><b>Nome Completo: </b>' + ToString(item.nome) + '</p>';
        outString += '                            <p><b>Título Eleitor: </b>' + ToString(item.titulo) + '</p>';
        outString += '                            <p><b>Instrução: </b>' + ToString(item.instrucao) + '</p>';
        outString += '                            <p><b>Ocupação: </b>' + ToString(item.ocupacao) + '</p>';
        outString += '                            <p><b>Cargos: </b>' + ToString(item.cargos) + '</p>';

        if (ToString(item.processos) != '')
            outString += '                            <p><b>Processos: </b>' + ToString(item.processos) + '</p>';
        else
            outString += '                            <p></p>';

        outString += '                        </div>';
        outString += '                    </div>';
        outString += '                </div>';
        outString += '                <div class="panel panel-default">';
        outString += '                    <div class="panel-heading">';
        outString += '                        <h4 class="panel-title">';
        outString += '                            <a data-toggle="collapse" data-parent="#accordion" href="#collapseBens" onclick="searchBens(' + item.id + ');">';
        outString += '                                Bens Declarados';
        outString += '                            </a>';
        outString += '                        </h4>';
        outString += '                    </div>';
        outString += '                    <div id="collapseBens" class="panel-collapse collapse">';
        outString += '                        <div class="panel-body">';
        outString += '                            <table id="tblBens" class="table table-hover table-striped table-curved">';
        outString += '                                <thead>';
        outString += '                                    <tr>';
        outString += '                                        <th>Bem</th>';
        outString += '                                        <th>Montante</th>';
        outString += '                                        <th>Ano</th>';
        outString += '                                    </tr>';
        outString += '                                </thead>';
        outString += '                                <tbody>';
        outString += '                                    <tr>';
        // --- BENS --->
        outString += '                                    </tr>';
        outString += '                                </tbody>';
        outString += '                            </table>';
        outString += '                        </div>';
        outString += '                    </div>';
        outString += '                </div>';
        outString += '                <div class="panel panel-default">';
        outString += '                    <div class="panel-heading">';
        outString += '                        <h4 class="panel-title">';
        outString += '                            <a data-toggle="collapse" data-parent="#accordion" href="#collapseDoadores"  onclick="searchDoadores(' + item.id + ');">';
        outString += '                                Doadores em 2010';
        outString += '                            </a>';
        outString += '                        </h4>';
        outString += '                    </div>';
        outString += '                    <div id="collapseDoadores" class="panel-collapse collapse">';
        outString += '                        <div class="panel-body">';
        outString += '                            <table id="tblDoadores" class="table table-hover table-striped table-curved">';
        outString += '                                <thead>';
        outString += '                                    <tr>';
        outString += '                                        <th>Nome</th>';
        outString += '                                        <th>CPF/CNJP</th>';
        outString += '                                        <th>Montante</th>';
        outString += '                                    </tr>';
        outString += '                                </thead>';
        outString += '                                <tbody>';
        outString += '                                    <tr>';
        // --- DOADORES --->                                     
        outString += '                                    </tr>';
        outString += '                                </tbody>';
        outString += '                            </table>';
        outString += '                        </div>';
        outString += '                    </div>';
        outString += '                </div>';
        outString += '                <div class="panel panel-default">';
        outString += '                    <div class="panel-heading">';
        outString += '                        <h4 class="panel-title">';
        outString += '                            <a data-toggle="collapse" data-parent="#accordion" href="#collapseCandidaturas"  onclick="searchCandidaturas(' + item.id + ');">';
        outString += '                                Histórico de Candidaturas';
        outString += '                            </a>';
        outString += '                        </h4>';
        outString += '                    </div>';
        outString += '                    <div id="collapseCandidaturas" class="panel-collapse collapse">';
        outString += '                        <div class="panel-body">';
        outString += '                            <table id="tblCandidaturas" class="table table-hover table-striped table-curved">';
        outString += '                                <thead>';
        outString += '                                    <tr>';
        outString += '                                        <th>Cargo</th>';
        outString += '                                        <th>Resultado</th>';
        outString += '                                        <th>Votos</th>';
        outString += '                                        <th>Recursos</th>';
        outString += '                                        <th>Ano</th>';
        outString += '                                    </tr>';
        outString += '                                </thead>';
        outString += '                                <tbody>';
        // --- CANDIDATURAS --->
        outString += '                                </tbody>';
        outString += '                            </table>';
        outString += '                        </div>';
        outString += '                    </div>';
        outString += '                </div>';
        outString += '            </div>';
        outString += '        </div><!-- fim modal-body -->';
        outString += '        <div class="modal-footer">';
        outString += '            <button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>';
        outString += '        </div>';
        outString += '    </div>';
        outString += '</div>';

        $('#myModalCandidato').html(outString);

    });
}

function push_Bens(data) {

    $('#tblBens tbody').push();

    $(data).each(function (index, item) {
        outString = '';
        outString += ' <tr>'
        outString += '  <th>' + ToString(item.bem) + '</th>';
        outString += '  <th>' + ToString(item.montante) + '</th>';
        outString += '  <th>' + ToString(item.ano) + '</th>';
        outString += ' </tr>';

        $('#tblBens tbody').append(outString);
    });

}

function push_Doadores(data) {

    $('#tblDoadores tbody').empty();

    $(data).each(function (index, item) {
        outString = '';
        outString += ' <tr>'
        outString += '  <th>' + ToString(item.nome) + '</th>';
        outString += '  <th>' + ToString(item.cgc) + '</th>';
        outString += '  <th>' + ToString(item.montante) + '</th>';
        outString += ' </tr>';

        $('#tblDoadores tbody').append(outString);
    });

}

function push_Candidaturas(data) {

    $('#tblCandidaturas tbody').push();

    $(data).each(function (index, item) {
        outString = '';
        outString += ' <tr>'
        outString += '  <th>' + ToString(item.cargo) + '</th>';
        outString += '  <th>' + ToString(item.resultado) + '</th>';
        outString += '  <th>' + ToString(item.votosObtidos) + '</th>';
        outString += '  <th>' + ToString(item.recursosFinanceiros) + '</th>';
        outString += '  <th>' + ToString(item.anoEleitoral) + '</th>';
        outString += ' </tr>';

        $('#tblCandidaturas tbody').append(outString);
    });

}

function ToString(string) {
    if (string === undefined || string === null)
        return '';
    else
        return string;
}

function SetVoto(obj) {

}

function FilterSearchCandidatos(data)
{
    var arraySearchFilter = new Array();
    var ret = false;

    $(data).each(function (index, item) {

        if ($('#optSupCompleto').val() == 'S' && item.instrucao.indexOf('SUPERIOR') > -1)
            ret = true;
        else if ($('#optSupCompleto').val() == 'N' && item.instrucao.indexOf('SUPERIOR') == -1)
            ret = true;

        if ($('#optExpPolitica').val() == 'S' && ToString(item.cargos) != '')
            ret = true;
        else if ($('#optExpPolitica').val() == 'N' && ToString(item.cargos) == '')
            ret = true;

        if ($('#optProcesso').val() == 'S' && ToString(item.processos) != '')
            ret = true;
        else if ($('#optProcesso').val() == 'N' && ToString(item.processos) == '')
            ret = true;

        if (ret)
            arraySearchFilter.push(item);

    });

    return arraySearchFilter;
}

//b = true -> Mostra Candidatos
//b = false -> Mostra Campos de Pesquisa
function SetStatePage(b) {
    if (b) {
        $("#divLabel").hide();
        $("#divCargosEstados").hide();
        $("#divCaracteristicas").hide();
        $("#divCandidatos").show();
        $("#btnVoltar").show();
    }
    else {
        
        $("#divLabel").show();
        $("#divCargosEstados").show();
        $("#divCaracteristicas").show();
        $("#divCandidatos").hide();
        $("#btnVoltar").hide();
    }
}
