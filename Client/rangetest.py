# -*- coding: utf-8 -*-

from bs4 import BeautifulSoup
import requests
import asyncio
import websocket

url = 'http://prjkt.zz.am/?server=0'

for i in range(1000):
    r = requests.get(url)

    soup = BeautifulSoup(r.text, "html.parser")

    wsurl = soup.find(id="URL")
    wsurl = str(wsurl)
    wsurl = wsurl[15:-7]
    print('url : ' + str(wsurl))

    def on_message(ws, message):
        #print(message)
        pass

    def on_error(ws, error):
        #print(error)
        pass

    def on_close(ws):
        #print("### closed ###")
        pass

    def on_open(ws):
        ws.send('{"type":"message","value":"Client No.'+str(i+1)+' Connected."}')
        ws.close()

    websocket.enableTrace(True)
    ws = websocket.WebSocketApp(wsurl,
    on_message = on_message,
    on_error = on_error,
    on_close = on_close
    )
    ws.on_open = on_open
    ws.run_forever()

    print('Client No.'+str(i+1)+' done')