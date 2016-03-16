$(document).ready(function() {
	$(document).keypress(function(event){
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if(keycode == '13'){
			apply();   
		}
	});
    $('#bgopacity').change(changeOpacity);
	$('#loadDataBtn').click(function() {$('#openFile').click();});
	$('#openFile').bind('change',loadData);
	$('#apply').click(apply);
	$('#version').change(chooseVersion);
	$('input:checkbox').change(customization);
	$('.popup-trigger').click(openPopup);
	$('.popup').click(closePopup);
	$('.colorTag').click(changeColor);
});

var colorMark;
function changeColor() {
	color = this.style.backgroundColor;
	elementId = "#" + colorMark;
	$(elementId).css('background-color', color);
	closePopup;
}

function closePopup(event) {
	if($(event.target).is('.popup') || $(event.target).is('.colorTag')) {
		$(this).css('visibility', 'hidden');
	}
}

function openPopup() {
	var position = $(this).offset();
	position.top = position.top+24;
	$('.popup-container').css(position);
	$('.popup').css('visibility', 'visible');
	$('.popup').css('z-index', 100); 
	colorMark = this.id;
}

function changeOpacity() {
    var opacity = $('#bgopacity').val()/100;
    $('#viewer').css('background-color', 'rgba(255, 255, 255, ' + opacity + ')');
}

var data;
var graph = {};
function loadData(event) {
    var files = event.target.files;
	var file = files[0];
	var reader = new FileReader();
	data = [];

	reader.onload = function(event) {
		// Load data
		var csv = reader.result;
		data = $.csv.toObjects(csv, {separator: ";"});
		var info = '<p>Load' + '&nbsp;' + file.name + '</p>';
		$('#info').append(info);
		$('#info').animate({scrollTop: $('#info').prop('scrollHeight')}, 1000);

		// Set source and target options
		var counter = 0;
		$('#source option').remove();
		$('#target option').remove();
		Object.keys(data[0]).forEach(function(item){
			$('#source').append($('<option>', {
				value: item,
				text: item
			}));
			$('#target').append($('<option>', {
				value: item,
				text: item
			}));
			$('#nodeCValue').append($('<option>', {
				value: item,
				text: item
			}));
			$('#edgeCValue').append($('<option>', {
				value: item,
				text: item
			}));
			
			if (counter == 0) {
				$('#source').val(item);
			}
			
			if (counter == 1) {
				$('#target').val(item);
			}
			counter++;
		});
	};
	
	reader.readAsText(file);
	this.value = null;
}

function chooseVersion() {
	var version = this.value;
	$('#gridRangeOpt').remove();
	$('#thetaOpt').remove();
	$('#levelOpt').remove();
	switch(version) {
		case "grid":
			// Add more options for grid version
			var newOption = '<tr id="gridRangeOpt">'+
								'<td>' + '<p class="font_0" style="font-size: 14px;">Grid Range</p>' + '</td>' +
								'<td>' + '<input type="number" id="gridRange" step="5" value="100" style="float:right;width:50px;"/>' + '</td>' +
							'</tr>';
			$('#moreOptions tr:last').after(newOption);

			break;
		case "barnes":
			var theta = '<tr id="thetaOpt">'+
							'<td>' + '<p class="font_0" style="font-size: 14px;">Theta</p>' + '</td>' +
							'<td>' + '<input type="number" id="theta" step="0.1" value="1.5" style="float:right;width:50px;"/>' + '</td>' +
						'</tr>';
			$('#moreOptions tr:last').after(theta);
			var level = '<tr id="levelOpt">'+
							'<td>' + '<p class="font_0" style="font-size: 14px;">Level</p>' + '</td>' +
							'<td>' + '<input type="number" id="level" step="1" value="6" style="float:right;width:50px;"/>' + '</td>' +
						'</tr>';
			$('#moreOptions tr:last').after(level);
			break;
	}
	var text = $(this).find("option:selected").text();
	var info = '<p>Choose' + '&nbsp;' + text + '</p>';
	$('#info').append(info);
	$('#info').animate({scrollTop: $('#info').prop('scrollHeight')}, 1000);
}

function apply() {
	var version = $('#version').val();
	if(data) {
		// Create graph
		createGraph(data, graph);
		var list = [];
		switch(version) {
			case "basic":
				var start = new Date().getTime();
				fdBasic(graph);
				var end = new Date().getTime();
				var time = end - start;
				var html = time /1000 + "S";
				$('#fdTime').html(html);
				render(graph);
				break;
			case "grid":
				var start = new Date().getTime();
				fdGrid(graph);
				var end = new Date().getTime();
				var time = end - start;
				var html = time /1000 + "S";
				$('#fdTime').html(html);
				render(graph);
				break;
			case "barnes":
				var start = new Date().getTime();
				fdBarnes(graph);
				var end = new Date().getTime();
				var time = end - start;
				var html = time /1000 + "S";
				$('#fdTime').html(html);
				render(graph);
				break;	
			case "multilevel":
				//createGraphW(data, graph);
				var start = new Date().getTime();
				fdMulti(graph);
				var end = new Date().getTime();
				var time = end - start;
				var html = time /1000 + "S";
				$('#fdTime').html(html);
				render(graph);
				break;
		}
		var text = $('#version').find("option:selected").text();
		var info = '<p>Run' + '&nbsp;' + text + '</p>';
		$('#info').append(info);
		$('#info').animate({scrollTop: $('#info').prop('scrollHeight')}, 1000);
	}else {
		var info = '<p>Load Data First !</p>';
		$('#info').append(info);
		$('#info').animate({scrollTop: $('#info').prop('scrollHeight')}, 1000);
	}
}

function customization() {
	if(this.checked) {
		if(this.id == "nodeC") {
			$('#nodeCValue').css('visibility', 'visible');
			graph.nodeC = true;
			$('#ns').text("Node Maxium");
		}else {
			$('#edgeCValue').css('visibility', 'visible');
			graph.edgeC = true;
			$('#et').text("Edge Maxium");
		}
	}else {
		if(this.id == "nodeC") {
			$('#nodeCValue').css('visibility', 'hidden');
			delete graph.maxNodeC;
			graph.nodeC = false;
			$('#ns').text("Node Size");
		}else {
			$('#edgeCValue').css('visibility', 'hidden');
			graph.edgeC = false;
			$('#et').text("Edge Thickness");
		}
	}
}

function showColorBoard(position) {
	var top = position.top;
	var left = position.left;
	$('#colorBoard').css('visibility', 'visible');
	$('#colorBoard').css('top', top+24);
	$('#colorBoard').css('left', left+5);
}