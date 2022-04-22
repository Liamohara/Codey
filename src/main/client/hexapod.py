# Standard library imports
import socket
from threading import Thread

# Local imports
from lib.console import cyan, error

HEADER = 64
PORT = 5050
TARGET = "hexapod.local"
FORMAT = "utf-8"
WALK_MSG = "!WALK"
BALANCE_MSG = "!BALANCE"
RELAX_MSG = "!RELAX"
COMPLETED_MSG = "!COMPLETED"
DISCONNECT_MSG = "!DISCONNECT"


class Client:
    def __init__(self):
        # Event is set when an instructiom is fully completed by the hexapod.
        self.__completed = False

        try:
            self.__socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        except socket.error as e:
            print(error(f"[ERROR] Error creating socket: {e}"))

    def start(self):
        print("[CONNECTING] Connecting to server...")

        TARGET_ADDR = ""
        try:
            TARGET_ADDR = socket.gethostbyname(TARGET)
        except socket.gaierror as e:
            print(
                error(f"[ERROR] Could not find hexapod. Is it turned on?: {e}"))
            return

        try:
            self.__socket.connect((TARGET_ADDR, PORT))
        except socket.gaierror as e:
            print(
                error(f"[ERROR] Address-related error connecting to server: {e}"))
            return
        except socket.error as e:
            print(error(f"[ERROR] Connection error: {e}"))
            return

        print("[CONNECTED] Connected to server.")

        Thread(self.__handler())

    def __handler(self):
        connected = True
        while connected:
            msg_length = self.__socket.recv(
                HEADER).decode(FORMAT)

            if msg_length:
                msg_length = int(msg_length)

                try:
                    msg = self.__socket.recv(msg_length).decode(FORMAT)
                except socket.error as e:
                    print(error(f"[ERROR] Error receiving data: {e}"))
                    return

                if msg == COMPLETED_MSG:
                    self.__completed = True
                elif msg == DISCONNECT_MSG:
                    connected = False
                else:
                    print(cyan(msg))

        self.__socket.close()
        print(f"[DISCONNECTED] Disconnected from server.")

    def __send(self, instruction):
        msg = "#".join(instruction)
        msg = msg.encode(FORMAT)

        msg_len = len(msg)
        send_len = str(msg_len).encode(FORMAT)
        send_len += b" " * (HEADER - len(send_len))

        try:
            self.__socket.send(send_len)
            self.__socket.send(msg)
        except socket.error as e:
            print(error(f"[ERROR] Error sending data: {e}"))
            return

        while not self.__completed:
            pass
        self.__completed = False

    def walk(self, paces, dir):
        self.__send([WALK_MSG, paces, dir])

    def balance(self):
        self.__send([BALANCE_MSG])

    def relax(self):
        self.__send([RELAX_MSG])

    def disconnect(self):
        self.__send(DISCONNECT_MSG)
