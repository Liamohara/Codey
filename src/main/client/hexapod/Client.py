# Standard library imports
import socket

# Local imports
from lib.console import cyan, error

HEADER = 64
PORT = 5050
TARGET = socket.gethostbyname("hexapod")
FORMAT = "utf-8"
WALK_MSG = "!WALK"
BALANCE_MSG = "!BALANCE"
RELAX_MSG = "!RELAX"
DISCONNECT_MSG = "!DISCONNECT"

try:
    socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
except socket.error as e:
    raise Exception(error(f"Error creating socket: {e}"))

def start():
    print("[CONNECTING] Connecting to server...")
    try:
        socket.connect((TARGET, PORT))
    except socket.gaierror as e:
        raise Exception(
            error(f"Address-related error connecting to server: {e}"))
    except socket.error as e:
        raise Exception(error(f"Connection error: {e}"))

    print("[CONNECTED] Connected to server.")

    handler()

def handler():
    connected = True
    while connected:
        msg_length = socket.recv(
            HEADER).decode(FORMAT)

        if msg_length:
            msg_length = int(msg_length)

            try:
                msg = socket.recv(msg_length).decode(FORMAT)
            except socket.error as e:
                raise Exception(error(f"Error receiving data: {e}"))

            if msg == DISCONNECT_MSG:
                connected = False
            else:
                print(cyan(msg))

    socket.close()
    print(f"[DISCONNECTED] Disconnected from server.")

def send_instruction(instruction):
    msg = "#".join(instruction)
    msg = msg.encode(FORMAT)

    msg_length = len(msg)
    send_length = str(msg_length).encode(FORMAT)
    send_length += b" " * (HEADER - len(send_length))

    try:
        socket.send(send_length)
        socket.send(msg)
    except socket.error as e:
        raise Exception(error(f"Error sending data: {e}"))

def walk(paces, dir):
    send_instruction([WALK_MSG, paces, dir])

def balance():
    send_instruction([BALANCE_MSG])

def relax():
    send_instruction([RELAX_MSG])

def disconnect():
    send_instruction(DISCONNECT_MSG)
