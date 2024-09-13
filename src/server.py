import asyncio
import websockets
import json

conferencias = {}

async def handleChatConnection(websocket, path):
    conferencia = path.strip("/") or "default"
    if conferencia not in conferencias:
        conferencias[conferencia] = {"chat": set(), "video": set()}
    conferencias[conferencia]["chat"].add(websocket)

    try:
        async for message in websocket:
            for client in conferencias[conferencia]["chat"]:
                if client != websocket:
                    await client.send(message)
    finally:
        conferencias[conferencia]["chat"].remove(websocket)
        if not conferencias[conferencia]["chat"] and not conferencias[conferencia]["video"]:
            del conferencias[conferencia]


async def sendAvailableConferences(websocket, path):
    conferencias_disponiveis = list(conferencias.keys())
    await websocket.send(json.dumps(conferencias_disponiveis))


async def handleVideoConnection(websocket, path):
    conferencia = path.strip("/") or "default"
    if conferencia not in conferencias:
        conferencias[conferencia] = {"chat": set(), "video": set()}
    conferencias[conferencia]["video"].add(websocket)

    try:
        async for message in websocket:
            for client in conferencias[conferencia]["video"]:
                if client != websocket:
                    await client.send(message)
    finally:
        conferencias[conferencia]["video"].remove(websocket)
        if not conferencias[conferencia]["chat"] and not conferencias[conferencia]["video"]:
            del conferencias[conferencia]


chatServer = websockets.serve(handleChatConnection, "localhost", 3333)
conferenceListServer = websockets.serve(sendAvailableConferences, "localhost", 3334)
videoServer = websockets.serve(handleVideoConnection, "localhost", 3335)

asyncio.get_event_loop().run_until_complete(chatServer)
asyncio.get_event_loop().run_until_complete(conferenceListServer)
asyncio.get_event_loop().run_until_complete(videoServer)
asyncio.get_event_loop().run_forever()