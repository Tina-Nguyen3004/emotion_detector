## How to Run the Project
To start both the FastAPI backend and the React frontend, simply run the provided shell script from the root of the repository:

```bash
./run.sh
```

This script will:
1. Create and activate the Python virtual environment (if not already created)
2. Install all required backend dependencies from requirements.txt
3. Start the FastAPI server on port 8000
4. Start the React frontend on port 3000
Once the script finishes, you can access the application in your browser at:
`http://localhost:3000`

## Project Structure 
```bash
root/
├── emotion-server/
│   ├── main.py
│   ├── models.py
│   ├── helpers.py
│   ├── database.py
│
├── emotion-client/
│   ├── src/App.js
│   ├── src/pages/AnalyzePage.js
│   ├── src/pages/HistoryPage.js
│   ├── src/pages/HomePage.js
│   ├── src/pages/ImageDetailPage.js
│   ├── src/pages/VideoDetailPage.js
│
├── requirements.txt
│
├── run.sh
│
├── CMPUT398 Report.pdf
│
└── README.md
```