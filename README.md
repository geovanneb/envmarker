# Environment Marker

Environment Marker is a free and open‐source browser extension that helps you easily differentiate between your project environments—such as development, QA, staging, and production—by placing a distinctive colored label on your browser window.

[Watch the video](https://vimeo.com/1058857684/353206bd55)

Maintainer: [Bertonha](https://github.com/geovanneb)

## Official Links

- **Web Browser Stores:**
The Environment Marker is available for the most popular web browsers.
![Browsers](browsers.png)
  - [Chrome Web Store](https://chrome.google.com/webstore/detail/environment-marker/ahjhdebcnlgmojdmjnhikhakkghcchkk)
  - [Safari App Store](https://apps.apple.com/jp/app/environment-marker-extension/id6742322010)
  - [Edge Add-ons Store](https://microsoftedge.microsoft.com/addons/detail/environment-marker/ncocphkcmlnbndlopcjclpogloanoija)
  - [Firefox Add-ons Store](https://addons.mozilla.org/firefox/addon/environment-marker-extension/)

## Donations

[![Donate with PayPal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=SRFRGVMAUJB3N&currency_code=BRL&source=url)

Starting January 1st, 2022, all donations will be directed to [GRAACC](https://graacc.org.br), a Brazilian support group for teenagers and children with cancer.

> **Why Environment Marker?**  
> In many IT projects, multiple environments share nearly identical interfaces—dev, QA, stage, and production. This similarity often leads to costly mistakes, such as performing tests or configurations in the wrong environment. Environment Marker visually distinguishes each environment, so you never mix them up again.

---

## Getting Started

### Prerequisites

- Ensure you have [Node.js](https://nodejs.org/) installed.
- Install Gulp CLI globally:

  ```sh
  npm install --global gulp-cli
  ```

- Install the project dependencies:

  ```sh
  npm install
  ```

---

## Gulp Tasks Overview

This project uses [Gulp](https://gulpjs.com/) to automate build tasks. Here’s a summary of the available tasks:

- **clean-dist**  
  Clears the `dist` folder.

- **js**  
  Transpiles and minifies JavaScript files (using Terser) from `app/scripts` with source maps.

- **process-firebase-config**  
  Reads the Firebase configuration from `app/config/firebase-config.json` and replaces the placeholder (`%%FIREBASE_CONFIG%%`) in `app/background.js` before processing.

- **copy-html**  
  Copies HTML files from `app/html` to `dist/html`.

- **copy-css**  
  Minifies CSS files from `app/styles` (using UglifyCSS) and copies them to `dist/styles` with source maps.

- **copy-images**  
  Copies image assets from `app/images` to `dist/images`.

- **copy-manifest**  
  Copies the default Chrome manifest (`app/manifest.json`) to `dist`.

- **copy-firefox-manifest**  
  Copies the Firefox-specific manifest (`app/manifest_firefox.json`), renames it to `manifest.json`, and places it in `dist`.

- **copy-locales**  
  Copies localization files from `app/_locales` to `dist/_locales`.

- **copy-libs**  
  Copies necessary library dependencies from `node_modules` into `dist/scripts/libs` (excluding Firebase files where necessary) and adjusts paths for Firebase files.

- **copy-textfit**  
  Copies the `textFit.min.js` file from the textfit package to `dist/scripts/libs/textfit`.

- **watch**  
  Watches source files (CSS, HTML, images, manifests, locales, and JavaScript) and automatically runs the corresponding tasks upon changes.

- **zip**  
  Packages the entire `dist` folder into a ZIP file. The ZIP is named based on the extension version from the manifest (e.g., `Environment Marker-<version>.zip`) and saved in the `package` folder.

- **build**  
  Runs a full build for the default (Chrome) version:
  - Cleans `dist`
  - Processes JavaScript and Firebase configuration
  - Copies HTML, CSS, images, the default manifest, locales, and libraries
  - Also copies the textfit dependency

- **build:firefox**  
  Same as the default build, but uses the Firefox-specific manifest.

- **package**  
  Runs the default build followed by the ZIP packaging task for Chrome.

- **package:firefox**  
  Runs the Firefox build followed by the ZIP packaging task for Firefox.

- **default**  
  Runs the default build and starts the file watcher.

---

## Build and Packaging Instructions

### Building for Chrome (Default)

To build the extension for Chrome, run:

```bash
gulp build
```

This command will:
- Clean the distribution folder.
- Process and minify your JavaScript, HTML, CSS, and images.
- Copy the default Chrome manifest, locales, libraries, and textfit dependency.

### Building for Firefox

To build for Firefox (using the Firefox-specific manifest), run:

```bash
gulp build:firefox
```

### Packaging the Extension

After building the extension, package it into a ZIP file for distribution.

For the default (Chrome) build:

```bash
gulp package
```

For the Firefox build:

```bash
gulp package:firefox
```

The resulting ZIP file will be located in the `package` folder and will be named according to the version specified in the manifest (e.g., `Environment Marker-1.0.0.zip`).

### Running the Watcher

For development, you can use the watch task to automatically rebuild when source files change:

```bash
gulp
```

This will run the default build and then start watching your files.

---

## How to Use the Extension

1. **Installation:**  
   Install the extension from your preferred web browser store.

2. **Configuration:**  
   - Navigate to your browser’s extensions page (e.g., Browser Configurations > More Tools > Extensions).
   - Click on the Environment Marker options menu.
   - Configure your environments by setting URLs and choosing a colored label.
   - Click the Save button to apply your settings.

---

## Contributing

Contributions, bug reports, and feature requests are welcome. Please open an issue or submit a pull request on [GitHub](https://github.com/geovanneb/envmarker).

---

## License

This project is open-source. Please review the LICENSE file for more details.

---