import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import subprocess
import sys

class Watcher:
    def __init__(self, directory, filename):
        self.observer = Observer()
        self.directory = directory
        self.filename = filename

    def run(self):
        event_handler = Handler(self.filename)
        self.observer.schedule(event_handler, self.directory, recursive=True)
        self.observer.start()
        try:
            while True:
                time.sleep(5)
        except:
            self.observer.stop()
        self.observer.join()

class Handler(FileSystemEventHandler):
    def __init__(self, filename):
        self.filename = filename
        self.process = None
        self.run_program()

    def on_any_event(self, event):
        if event.src_path.endswith('.py'):
            print(f"Change detected: {event.src_path}")
            self.restart_program()

    def run_program(self):
        print("Starting program...")
        self.process = subprocess.Popen([sys.executable, self.filename])

    def restart_program(self):
        if self.process:
            self.process.terminate()
        self.run_program()

if __name__ == "__main__":
    watcher = Watcher('.', 'main.py')  # Adjust 'main.py' to your main file's name
    watcher.run()


