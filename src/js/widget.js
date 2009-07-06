var gDoneButton = null;
var gInfoButton = null;


function setup() {
	gDoneButton = new AppleGlassButton(document.getElementById("done"), "Back", function() { showFront() });
	gInfoButton = new AppleInfoButton(document.getElementById("info"), document.getElementById("front"), "white", "white", function() { showBack() });
	
	loadChannels();
	
	$('#channels').change(changeChannel);
	
	window.radio = document.embeds[0];
	
	setInterval(updateStatus, 1000);
}

function showBack(animate) {
	if(animate == undefined)
		animate = true;
	
	var front = document.getElementById("front");
	var back = document.getElementById("back");
	
	if(animate)
		widget.prepareForTransition("ToBack");
	
	front.style.display="none";
	back.style.display="block";
	
	if(animate)
		setTimeout('widget.performTransition();', 0);
}

function showFront(animate) {
	if(animate == undefined)
		animate = true;
	
	var front = document.getElementById("front");
	var back = document.getElementById("back");
	
	if(animate)
		widget.prepareForTransition("ToFront");
	
	back.style.display="none";
	front.style.display="block";
	
	if(animate)
		setTimeout('widget.performTransition();', 0);
}

function setChannel(url) {
	radio.SetURL(url);
}

function playRadio() {
	radio.Play();
}
function stopRadio() {
	radio.Stop();
}

function loadChannels() {
	$.get('http://www.dr.dk/CMSNETRADIO/Kanaler/kanaler', {}, function(root) {
		console.log(root);
		window.channels = root;
		window.STREAM_BASE_URL = $(root).find('netradio > stream:first').attr('path');
		$(root).find("channels > channel").each(addChannel);
		$(root).find("channels > netChannel > channel").each(addChannel);
	});
}

function addChannel() {
	var node = this;
	var STREAM_BASE = '';
	
	var name = $(this).find(">name").text();
	var streamName = $(this).find(">streamName").text();
	var streamURL = STREAM_BASE_URL + streamName + '128' + '.asx';
	
	// subchannels' parent does not have a master stream name
	if(streamName) {
		$("#channels").append('<option value="'+streamURL+'">'+name+'</option>');
	}
	
	var subchannels = $(this).find(">subChannel");
	if(subchannels.size() > 0) {
		subchannels.each(addChannel);
	}
}

function changeChannel() {
	setChannel(this.value);
}

function updateStatus() {
	$("#status").text(radio.GetPluginStatus());
}


