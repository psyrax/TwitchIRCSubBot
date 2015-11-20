$(document).ready(function(){
	$.ajax({
		url: '/ajax/subs/',
		success: function(data){
			console.log(data);
			$.each(data, function(index, sub){
				var template =  '<tr><th scope="row">'+ (parseInt(index)+1) +'</th><td>'+ sub.user.display_name +'</td><td>'+ timeSince(sub.created_at) +'</td></tr>';
				$('#usersTable').append(template);
			});
		},
		error: function(error){
			$('#callbacks').html('<div class="alert alert-danger"role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><strong>'+ error.responseJSON +'</strong></div>');
		}
	})
});
function timeSince(rawDate) {
	var monthDate = rawDate.split('T');
	return moment(monthDate[0]).fromNow();
}