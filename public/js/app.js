$(document).ready(function(){
	getSubs();
	$('#updateList').on('click', function(event){
		event.preventDefault();
		getSubs();
		return false;
	});
});
function timeSince(rawDate) {
	var monthDate = rawDate.split('T');
	return moment(monthDate[0]).fromNow();
};
function getSubs(){
	$('#usersTable').empty();
	$.ajax({
		url: '/ajax/subs/',
		success: function(data){
			$.each(data, function(index, sub){
				var template =  '<tr><th scope="row">'+ (parseInt(index)+1) +'</th><td>'+ sub.user.display_name +'</td><td>'+ timeSince(sub.created_at) +'</td><td><a href="#" class="btn btn-primary setDisplay  btn-twitchLogin" data-display="'+ sub.user.name +'">Display</a></td></tr>';
				$('#usersTable').append(template);
			});
			$('.setDisplay').on('click', function(event){
				event.preventDefault();
				var user = $(this).data('display');
				$.ajax({
					url: '/ajax/display/set',
					method: 'POST',
					data: {
						userToDisplay: user
					},
					success: function(data){
						$('#callbacks').html('<div class="alert alert-success" role="success"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><strong>Set to display: '+ user +'</strong></div>');					}

				})
				return false;
			});
		},
		error: function(error){
			$('#callbacks').html('<div class="alert alert-danger" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><strong>'+ error.responseJSON +'</strong></div>');
		}
	});

}