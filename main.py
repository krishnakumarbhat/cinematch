"""
CineMatch AI — Entry Point
Execution: 00_main.py → src/01_AppFactory.py → src/02_Routes.py

Starts the Flask server on port 5002.
"""
from importlib import import_module


create_app = import_module("src.01_AppFactory").create_app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)
