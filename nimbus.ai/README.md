# Nimbus.ai

Nimbus.ai is an interactive language model application that allows users to engage in conversations and maintain a history of their interactions. The application provides a user-friendly interface for inputting queries and receiving responses from the AI model.

## Features

- **User Interface**: The main interface is built using React and Material-UI, providing a responsive and modern design.
- **History Log**: Users can view their interaction history, including the date of the first query and the last communication date.
- **Theme Toggle**: The application supports light and dark themes, allowing users to customize their experience.
- **Settings**: Users can access settings to configure their preferences.

## Installation

To get started with Nimbus.ai, clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd nimbus.ai
npm install
```

## Usage

To run the application, use the following command:

```bash
npm start
```

This will start the development server and open the application in your default web browser.

## File Structure

```
nimbus.ai
├── lui
│   ├── src
│   │   ├── components
│   │   │   └── LanguageModelUI.js
│   │   ├── pages
│   │   │   └── HistoryLog.js
│   │   └── App.js
├── package.json
├── tsconfig.json
└── README.md
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.