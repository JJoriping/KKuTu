# -*- coding: utf-8 -*-

from bs4 import BeautifulSoup
import requests, websocket
print('start')
wsurl = str(BeautifulSoup(requests.get('http://prjkt.zz.am/?server=0').text, "html.parser").find(id="URL"))[15:-7]
print('url : ' + str(wsurl))
def on_message(ws, message):print(message)
def on_error(ws, error):print(error)
def on_close(ws):print("### closed ###")
def on_open(ws):ws.send('{"type":"message","value":"pytest"}')
websocket.enableTrace(True)
ws = websocket.WebSocketApp(wsurl,on_message = on_message,on_error = on_error,on_close = on_close)
ws.on_open = on_open
ws.run_forever()
print('done')