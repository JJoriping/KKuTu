$(document).ready(function(){
	$("#list").children().each(function(index, obj){
		var p = "c" + (index + 1);
		
		$(obj).attr('id', p).on('click', onMenu).find("li").each(function(_index, _obj){
			$(_obj).attr('id', p + "p" + (_index + 1)).on('click', onMenu);
		});
	});
	$("img").on('click', function(e){
		var $target = $(e.currentTarget);
		
		window.open($target.attr('src'), "", [
			"resizable=no", "status=no"
		].join(','));
	});
	
	function onMenu(e){
		$(".selected").removeClass("selected");
		var $target = $(e.currentTarget).addClass("selected");
		var id = $target.attr('id');
		var title = $target.children("label").html();
		var $tp = $target.parents("li");
		
		if($tp.length) title = $tp.children("label").html() + " > " + title;
		$("#page-head").html(title);
		$(".page-body").hide();
		$("#box-" + id).show();
		e.stopPropagation();
	}
});