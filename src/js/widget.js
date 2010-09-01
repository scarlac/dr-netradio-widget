var gDoneButton = null;
var gInfoButton = null;


function setup() {
	loadChannels();
	
	window.radio = document.embeds[0];
	window.channelList = [];
	window.channelListIndex = 0;
	$('#channel_play').click(playRadio);
	$('#channel_prev').click(prevChannel);
	$('#channel_next').click(nextChannel);
	
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
	$('#status').text('Playing...');
	if(channelListIndex >= 0) {
		radio.Stop();
		changeChannel();
		radio.Play();
		$('#channel_label').text(channelList[channelListIndex].name);
	}
}
function stopRadio() {
	radio.Stop();
}

function loadChannels() {
	$.get('http://www.dr.dk/CMSNETRADIO/Kanaler/kanaler', {}, function(root) {
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
		window.channelList.push({ url: streamURL, name: name });
	}
	
	var subchannels = $(this).find(">subChannel");
	if(subchannels.size() > 0) {
		subchannels.each(addChannel);
	}
}

function changeChannel() {
	setChannel(channelList[channelListIndex].url);
}

function updateStatus() {
	//var status = radio.GetPluginStatus();
	//if(status.toLowerCase() == 'waiting')
	//	status = '';
	//$("#status").text(status);
	var rate = radio.GetRate();
	if(rate > 0) { // Playing
		$('#channel_play').addClass('playing');
	} else {
		$('#channel_play').removeClass('playing');
	}
}

function prevChannel() {
	channelListIndex--;
	if(channelListIndex < 0)
		channelListIndex = window.channelList.length;
	$("#status").text(channelList[channelListIndex].name);
}

function nextChannel() {
	channelListIndex++;
	if(channelListIndex > window.channelList.length - 1)
		channelListIndex = 0;
	$("#status").text(channelList[channelListIndex].name);
}
