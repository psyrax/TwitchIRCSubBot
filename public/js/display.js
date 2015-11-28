$(document).ready(function(){
	$('#imageReel').trigger('play')
});
function getUserToDisplay(){
	$.ajax({
		url: '/display/',
		success: function(data){
			console.log(data);
		},
		error: function(error){
			$('#callbacks').html('<div class="alert alert-danger"role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><strong>'+ error.responseJSON +'</strong></div>');
		}
	})
}