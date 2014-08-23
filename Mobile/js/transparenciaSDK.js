$(document).ready(function() {
	$('label').click(function(){
		$(this).children('span').addClass('input-checked');
		$(this).parent('.toggle').siblings('.toggle').children('label').children('span').removeClass('input-checked');
	});
	
    $.ajax({
        url: "http://api.transparencia.org.br:80/sandbox/v1/cargos",
		contentType:"application/json; charset=utf-8",
		dataType:"json",
		headers: {
			"App-Token":"C3p9RzwVcOoz"
		}
	}).done(function(data) { 
		$.each( data, function( i, item ) {
			var outString = '';
			outString += '<div class="toggle"><label><input type="radio" name="toggle"><span>' + item.nome + '</span></label></div>';
			$('.lista-cargos').append(outString);
      });
	});
	
	$.ajax({
        url: "http://api.transparencia.org.br:80/sandbox/v1/estados",
		contentType:"application/json; charset=utf-8",
		dataType:"json",
		headers: {
			"App-Token":"C3p9RzwVcOoz"
		}
	}).done(function(data) { 

		$.each( data, function( i, item ) {
			var outString = '';
			outString += '<div class="toggle"><label><input type="radio" name="toggle"><span>' + item.sigla + '</span></label></div>';
			$('.lista-uf').append(outString);
      });
	});
});	

