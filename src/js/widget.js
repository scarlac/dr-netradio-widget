var gDoneButton = null;
var gInfoButton = null;


function setup() {
	loadChannels();
	
	window.radio = document.embeds[0];
	window.channelList = [];
	window.channelListIndex = -1;
	window.playingChannelIndex = -1;
	window.statusTimer = null;
	$('#channel_play').click(playRadio);
	$('#channel_prev').click(prevChannel);
	$('#channel_next').click(nextChannel);
	
	setInterval(updatePlaying, 1000);
	delayStatusUpdate();
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
	$('#status').text('Afspiller');
	if($('#front.playing #channel_play').is('.current')) {
		stopRadio();
	} else {
		radio.Stop();
		changeChannel();
		radio.Play();
		playingChannelIndex = channelListIndex;
		$('#channel_play').addClass('current');
		$('#channel_label').text(channelList[channelListIndex].name);
	}
}
function stopRadio() {
	radio.Stop();
	playingChannelIndex = -1;
	$('#status').text('Stopped');
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

function updatePlaying() {
	//var status = radio.GetPluginStatus();
	//if(status.toLowerCase() == 'waiting')
	//	status = '';
	//$("#status").text(status);
	var rate = radio.GetRate();
	if(rate > 0) { // Playing
		$('#front').addClass('playing');
	} else {
		$('#front').removeClass('playing');
	}
}

function delayStatusUpdate() {
	if(statusTimer != null)
		clearTimeout(statusTimer);
	statusTimer = setTimeout(function() {
		// Fall back to playing channel
		if(radio.GetRate() > 0) {
			channelListIndex = playingChannelIndex;
			$('#channel_play').addClass('current');
			$('#status').text('Afspiller');
		}
	}, 3000);
}

function prevChannel() {
	channelListIndex--;
	if(channelListIndex < 0)
		channelListIndex = window.channelList.length;
	if(channelListIndex == playingChannelIndex)
		$('#channel_play').addClass('current');
	else
		$('#channel_play').removeClass('current');
	$("#status").text(channelList[channelListIndex].name);
	delayStatusUpdate();
}

function nextChannel() {
	channelListIndex++;
	if(channelListIndex > window.channelList.length - 1)
		channelListIndex = 0;
	if(channelListIndex == playingChannelIndex)
		$('#channel_play').addClass('current');
	else
		$('#channel_play').removeClass('current');
	$("#status").text(channelList[channelListIndex].name);
	delayStatusUpdate();
}
