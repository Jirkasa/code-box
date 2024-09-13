
# Code Box

Code Box is a JavaScript library developed in TypeScript, designed for showcasing code samples on the web. While it doesn't provide syntax highlighting itself, it serves as a container that allows users to select and display different code samples. You can either enable users to switch between different code samples with a few buttons or present the entire source code in a project-like format. For syntax highlighting, you can use libraries like [highlight.js](https://highlightjs.org/).

- [Documentation](#)
- [Examples](#)
- [NPM](#)

## Installation

Code box is installed via NPM like any other package.

```
npm install code-box --save
```

After installation, you need to integrate the core CSS styles into your project. If you're using a CSS preprocessor, you can import the styles as shown below. If you're not using a preprocessor, simply copy the CSS file from the node_modules folder.

```
@import "code-box/style.min.css";
```

## Getting Started

To get started, check out the [Getting Started](#) guide. It includes examples and setup instructions for using Code Box in your projects.

## Contributing

If you'd like to contribute or explore the source code, you can clone this repository. The following commands are available to help you get started:

| Command | Description |
| ------- | ----------- |
| npm run dev | Starts development environment at http://localhost:3000/.
| npm run build | Builds the library for production into the dist/ folder.
| npm test | Runs tests.
| npm run coverage | Generates a test coverage report.

## License

This project is licensed under the [MIT License](#).