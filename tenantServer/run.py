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


#     OPENAI_API_KEY = 'sk-proj-eyhsvrDeYue1QeILfNgeT3BlbkFJ26zAd7rFuOXK5Cnjaiwy'
# WHATSAPP_TOKEN="EAAOD5Uw0NY8BO5x7408nlMPq2H4PB2MHdhImZB2s2V2CIZADd91hIyGQIGoVZCZCmBb5wCejxZCD8N43ipFZBSs1QYTTADpEd9mDdiHx8ZAZB8FZAOTNyT8EJhMltFNOUGp4gM5L3lQgx0pVsdtgXsOlPhZAVOZAy1URXZCzZC80kfL2iiO6AqY89oNfZBcXvZAbyr844lg2hdX0DZCt9amkECQiekE9vYqZA1lQH9QzlFAr4"
# WHATSAPP_PHONE_NUMBER_ID = "310868885445564"
# VERIFY_TOKEN = "TechWhatsapp2024"
# MONGO_URI='mongodb+srv://techvaseegrah:kL5RvAyrOQBVFQAc@cluster0.pbjj6kp.mongodb.net/F3-DB?retryWrites=true&w=majority&appName=Cluster0'
# SITE_URL="https://wpsg.microbizware.com/"