// Constants
var NUMBER_OF_CHANNELS = 35;
var PROGRAM_SERIES_URL = 'http://www.dr.dk/odp/default.aspx?template=flad_alle_programserier';

// Globals
var channelIdArr;
var programIdArr;
var programSeriesUrlArr;
var liveTvMap = {'dr1': 'mms://drcluster.jay.net/dr1', 'dr2': 'mms://drcluster.jay.net/dr2'};
var latestSelectId;
var liveSelectId;
var sProgramId;		// sProgramId and sChannelId have to be global because DR made getProgramUrl and getChannelUrl expect it so :( ...
var sChannelId;
var iBitrate = '128'; // '32', '64' or '128'
var req = new XMLHttpRequest();

function addOptionToSelectByName(selectName)
{
	var selectId = document.getElementById(selectName);
	addOptionToSelectById(selectId);
}

function addOptionToSelectById(selectId, key, value)
{
	var length = selectId.options.length;
	selectId.options[length] = new Option(key, value);
}

function populateSelect(selectId, idArr, getInfoFunc)
{
	for (var i in idArr) {
		var id = idArr[i];
		var name = getInfoFunc(id)[0];
		addOptionToSelectById(selectId, name, id);
	}
}

function chooseRadioProgram(event)
{
	var id = latestSelectId.options[latestSelectId.selectedIndex].value;
	sProgramId = id;
	var url = getProgramUrl();
	alert('###################### Tuk trying to play program: ' + id);
	play(url);
}

function chooseLiveRadio(event)
{
	var id = liveSelectId.options[liveSelectId.selectedIndex].value;
	sChannelId = id;
	var url = getChannelUrl();
	alert('###################### Tuk trying to play live: ' + id);
	play(url);
}

function chooseTvProgramSeries(event)
{
	var id = event.target.options[event.target.selectedIndex].value;
	alert(programSeriesUrlArr[id]);
//	sChannelId = id;
//	var url = getChannelUrl();
	alert('###################### Tuk trying to play live: ' + id);
	play(url);
}

function chooseLiveTv(event)
{
	var channel = event.target.value;
	var url = liveTvMap[channel];
	alert('###################### Tuk trying to play live tv: ' + channel);
	play(url);
}

function play(url)
{
	if (url != '' && isString(url)) {
		alert('Setting url: ' + url);
		set_item(url);
	}
	
	alert('play');
	document.vlc_plugin.play();
}

function pause()
{
	alert('pause');
	document.vlc_plugin.pause();
}

function stop()
{
	alert('stop');
	document.vlc_plugin.stop();
}

function fullscreen()
{
	alert('fullscreen');
	document.vlc_plugin.fullscreen();
}

function set_item(name)
{
	document.vlc_plugin.stop();
	document.vlc_plugin.clear_playlist();
	document.vlc_plugin.add_item(name);
}

function getChannelIdArr()
{
	var channelIdArr = [];

	for (var i = 1; i <= NUMBER_OF_CHANNELS; i++) {
		var id = id2string(i);
		// We have to check this because getChannelInfo() returns 'p3' as a default value
		// - and we only want 'p3' at index 3...
		if (!(id == 'p3' && (i != 3))) {
			channelIdArr[i] = id;
		}
	}

	return channelIdArr.sort();
}

function getProgramSeriesResponseHandler()
{
	// only if req shows "loaded"
	if (req.readyState == 4) {
		// only if "OK"
		if (req.status == 200) {
			alert('Responsehandler');
			// ...processing statements go here...
			populateTvSeriesSelect(req.responseText);
		}
		else {
			alert("There was a problem retrieving the data: " + req.statusText);
		}
	}
}

function init()
{
	latestSelectId = document.getElementById('latest_popup');
	liveSelectId = document.getElementById('live_popup');
	programSeriesId = document.getElementById('series_popup');
	channelIdArr = getChannelIdArr();
	programIdArr = getProgramIdArr();
	populateSelect(latestSelectId, programIdArr, getProgramInfo);
	populateSelect(liveSelectId, channelIdArr, getChannelInfo);
	getProgramSeries(PROGRAM_SERIES_URL);
}

function getProgramSeries(url)
{
	alert('getProgramSeries: ' + url);
	req.onreadystatechange = getProgramSeriesResponseHandler;
	req.open('GET', url);
	req.send('');
}

function getProgramSeriesData(hayStack, regex, preCutLength, postCutLength)
{
	var myArray = hayStack.match(regex);
	
	for (var i in myArray) {
		// Cutting the start of the string
		myArray[i] = myArray[i].substr(preCutLength);
		// Cutting the end of the string
		myArray[i] = myArray[i].substring(0, myArray[i].length - postCutLength);
	}
	
	return myArray.sort();
}

function getProgramSeriesNames(hayStack)
{
	    // '<div class="programTitle">' is 26 chars
	    // '</div>' is 6 chars
		return getProgramSeriesData(hayStack, programSeriesNameRegEx, 26, 6);
}

function getProgramSeriesUrls(hayStack)
{
		// '<a href="' is 9 chars
		// '">' is 2 chars
		return getProgramSeriesData(hayStack, programSeriesUrlRegEx, 9, 2);
}

function populateTvSeriesSelect(htmlStr)
{
	var nameArr = getProgramSeriesNames(htmlStr);
	programSeriesUrlArr = getProgramSeriesUrls(htmlStr);
	
	for (var i in nameArr) {
		addOptionToSelectById(programSeriesId, nameArr[i], nameArr[i]);
	}
}

function testReq()
{
	getProgramSeries(PROGRAM_SERIES_URL);
}

// I could not find any other way to get the program ids
// than to parse the definition of getProgramUrl() as a string.. :-|
function getProgramIdArr()
{
	var programIdArr = [];
	var str = getProgramUrl.toString();
	var re = /case \"(.+?)\"/g;
	var res = re.exec(str);

	while (res = re.exec(str)) {
		programIdArr.push(res[1]);
	}
	
	return programIdArr.sort();
}

var programSeriesNameRegEx = /<div class="programTitle">(.*?)<\/div>/g;
var programSeriesUrlRegEx = /<a href="default.aspx.*/g;