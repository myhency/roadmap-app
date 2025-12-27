"""
Roadmap Dashboard Desktop Application

PyWebView를 사용하여 FastAPI 앱을 데스크탑 앱으로 실행합니다.
"""

import os
import sys
import threading
import socket
import webview
import uvicorn

# 패키징된 앱에서 올바른 경로를 찾기 위한 설정
if getattr(sys, 'frozen', False):
    # PyInstaller로 패키징된 경우
    BASE_DIR = sys._MEIPASS
    os.chdir(BASE_DIR)
else:
    # 개발 환경
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    os.chdir(BASE_DIR)

from app.main import app


def find_free_port():
    """사용 가능한 포트를 찾습니다."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        return s.getsockname()[1]


def start_server(port):
    """FastAPI 서버를 백그라운드에서 실행합니다."""
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=port,
        log_level="warning"
    )


def main():
    # 사용 가능한 포트 찾기
    port = find_free_port()
    server_url = f"http://127.0.0.1:{port}"

    # 백그라운드 스레드에서 서버 시작
    server_thread = threading.Thread(
        target=start_server,
        args=(port,),
        daemon=True
    )
    server_thread.start()

    # 서버가 시작될 때까지 잠시 대기
    import time
    time.sleep(1)

    # PyWebView 창 생성
    window = webview.create_window(
        title="Roadmap Dashboard",
        url=server_url,
        width=1400,
        height=900,
        min_size=(800, 600),
        resizable=True,
        confirm_close=True
    )

    # 앱 시작
    webview.start()


if __name__ == "__main__":
    main()
