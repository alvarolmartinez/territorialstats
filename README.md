# TerritorialStats

## Description
TerritorialStats is a web application that scrapes and visualizes statistics from [territorial.io](https://territorial.io). Designed to provide insights into clan performances and trends, this tool uses Python Flask for backend operations, SQLite for data management, and D3.js for dynamic and interactive front-end visualizations.

## Features
- Real-time statistics updates from territorial.io clans.
- Interactive and detailed visualizations of clan performance metrics.
- Efficient data handling and storage using SQLite.
- User-friendly web interface for easy access to data.

## Technologies Used
- **Backend**: Python, Flask
- **Database**: SQLite
- **Frontend**: JavaScript, D3.js

## Getting Started (for Developers)
These instructions are for setting up the project in a development environment.

### Prerequisites
- Python 3.x
- Node.js and npm (for D3.js)

### Setup for Development
1. Clone the repository:
  ```git clone https://github.com/yourusername/territorial-clan-stats.git```
2. Navigate to the cloned repository.
3. Install Python dependencies:
  ```pip install -r requirements.txt```
4. Install JavaScript dependencies (if any):
  ```npm install```
5. Initialize the SQL database (if required):
  ```python init_db.py```

### Running locally
1. Start the Flask server for the backend:
  ```python app.py```

2. Access the application through a web browser at `localhost:5000` for frontend development and testing.

## Contributing
We welcome contributions to TerritorialStats. If you have suggestions or improvements, feel free to fork the repo and submit a pull request.

## Authors
- Griffin Tanner
- Alvaro Martinez

## License
This project is licensed under the [MIT License](LICENSE.md).

## Acknowledgments
- Thanks to the Territorial.io community.
- Special thanks to David Tschacher for developing Territorial.io.


