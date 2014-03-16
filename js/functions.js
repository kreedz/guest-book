$().ready(function() {
	function delete_messages() {
		var count_message = $('.message').length - 1;
		if (count_message > 0) {
			for(var i = 1; i <= count_message; ++i) {
				$('.message').last().remove();
			}			
		}
	}
	function add_message(name, message, date, message_id) {
		var message_clone = $('.message').first().clone().removeAttr('hidden');
		$('.message').first().after(message_clone);
		$('.message').eq(1).find('.author-data').text(name + ' написал ' + date + ':');
		$('.message').eq(1).find('span').text(message);	
		$('.message').eq(1).find('.message-id').text(message_id);
		$('.message').eq(1).find('img').each(function(){$(this).bind('click', function(){
			var parent = $(this).parent();
			if ($(this).attr('class') == 'image-delete') {
				 parent.find('.delete-message').toggle();
				 parent.find('.edit-message').hide();
			} else {
				 parent.find('.edit-message').toggle();
				 parent.find('.delete-message').hide();
				 parent.find('.edit-message').find('textarea').val(parent.find('span').text());
			};
		})});
		bind_for_del_edit_button($('.message').eq(1).find('.change'));
	}
	function load_page(e) {
		delete_messages();
		var parent = $(e.target).parent(),
			page = $(e.target).parent().find('span').text();
		$('.pagination-number').each(function(){$(this).find('a').css('background-color','white')})
		parent.css('background-color', 'grey');
		add_messages(page);
	}
	function delete_pagination() {
		var current_page = $('.pagination-number').length - 1;
		if (current_page > 0) {
			for(var i = 1; i <= current_page; ++i) {
				$('.pagination-number').last().remove();
			}
		}	
	}
	function add_pagination(message_count) {
		delete_pagination();
		page_count = Math.floor(message_count / 10) + 1;
		for(var i = 1; i <= page_count; ++i) {
			var pagination_clone = $('.pagination-number').first().clone().removeAttr('hidden');
			$('.pagination-number').last().after(pagination_clone);
			$('.pagination-number').last().find('span').text(i);
			$('.pagination-number').last().children().bind('click', function(e){
				load_page(e);
			});			
		}
	}
	$('input[name="send-message"]').click(function(){
		var name = $('input[name="name"]').val(),
			password = $('input[name="password"]').val(),
			message = $('#input-data textarea').val();
		$.post(
			"./new_message.php",
			{
				pauthor: name,
				ppassword: password,
				pmessage: message,
			},
			function(data) {
				if (data) {
					var data = jQuery.parseJSON(data),
						message_id = data.message_id,
						date = data.date;
					add_message(name, message, date, message_id);
				};
			}
		);
	});
	function add_messages(p) {
		$.post(
			"./pagination.php",
			{
				page: p,
			},
			function(data) {
				if (data) {
					var result = jQuery.parseJSON(data);
					for(var i in result.rows.reverse()) {
						add_message(result.rows[i].author, result.rows[i].message, result.rows[i].date, result.rows[i].message_id);
					}
					add_pagination(result.message_count);
					$('.pagination-number').eq(p).find('a').css('background-color','grey');
				};
			}
		);
	}
	add_messages(1);
	function getCurrentPage() {
		var page = 0;
		$('.pagination-number').each(function(){
			var a = $(this).find('a');
			if (a.attr('style')) {
				page = a.find('span').text();
				return false;
			}
		});
		if (page) return page;
	}
	function bind_for_del_edit_button(current_change_class) {
		current_change_class.find('input[type="button"]').each(function(){
			$(this).bind('click', function(){
				var author_data = $(this).parent().parent().find('.author-data').text(),
					name = /(.*?)\s\S*?\s\S*?:/.exec(author_data)[1],
					message = $(this).parent().find('textarea').val(),
					password = $(this).parent().find('input[type="password"]').val(),
					message_id = $(this).parent().parent().find('.message-id').text(),
					spanObj = $(this).parent().parent().find('span');
					action = $(this).parent().attr('class');
					action = action.substr(0, action.indexOf('-'));
				$.post(
					"./delete_edit.php",
					{
						paction: action,
						pauthor: name,
						ppassword: password,
						pmessage: message,
						pmessage_id: message_id,
					},
					function(data) {
						if (data) {
							if (action == 'edit') {
								spanObj.text(message);
								spanObj.parent().find('.edit-message').toggle();
							} else {
								delete_messages();
								add_messages(getCurrentPage());
							}
						}
					}
				);				
			});
		});
	}
});