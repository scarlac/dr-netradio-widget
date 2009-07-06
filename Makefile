default: clean widget

widget: clean
	cp -R src Netradio.wdgt
	rm -f Netradio.wdgt/css/debug.css

clean:
	rm -rf Netradio.wdgt

