PackMaster: 3D Bin Packing Optimization System
This project is a 3D packing optimization application that runs entirely in the browser using WebAssembly (Pyodide). It takes dynamic container and item data from the frontend, simulates 3D packing across multiple box types under weight/volume constraints, and returns precise coordinate maps for visual rendering.



💻 How to Run the Project Locally

Because the frontend fetches local Python files using standard browser network requests (fetch), opening the index.html file directly via double-click will trigger browser security (CORS) blocks. It must be served from a local server running at the root directory.

Open your terminal/command prompt.

Navigate to the root packmaster/ folder:
cd path/to/packmaster

Start the built-in Python lightweight web server:
python -m http.server 8000

Open your web browser and go to:
http://localhost:8000/web/

Open the developer console (F12) and click the button on the page to view the raw 3D coordinate output.
