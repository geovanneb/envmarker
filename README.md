# envmarker
Environment Marker Chrome Extension

Maintainer: [Bertonha](https://github.com/geovanneb)

Official link: [https://chrome.google.com/webstore/detail/environment-marker/ahjhdebcnlgmojdmjnhikhakkghcchkk](https://chrome.google.com/webstore/detail/environment-marker/ahjhdebcnlgmojdmjnhikhakkghcchkk)

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=SRFRGVMAUJB3N)

> We all know that is very common at least a 3 environments in our programming / IT projects (dev, staging, production). Generally they are all identical.
During these long years people has commited a lot of mistakes, in which we simply confuses environments and end up doing the procedures in wrong environments.
Who ever made that "little test" thinking it was doing in "dev" and suddenly realized he was in production. Also, it's no wonder. The environments are identical, except for discreet URL in the browser address bar. This situation is even more common when the application has an administrative interface.
With this in mind this extension for Google Chrome was developed, and makes it possible for you to configure the URLs of yours projects environments and puts a "huge label" on the top corner of the browser, identifying the environment for you 
with the color and name, according to what you have previously set.

## Getting Started

```sh
# Please make sure that `yo`, `gulp` and `bower` was installed on your system using this command:
npm install --global yo gulp-cli bower

# Run gulp install:
gulp install

# Run bower update:
bower update
```

## gulp tasks

### Build and Package

It will build your app as a result you can have a distribution version of the app in `dist`. Run this command to build your Chrome Extension app.

```bash
gulp build
```

You can also distribute your project with compressed file using the Chrome Developer Dashboard at Chrome Web Store. This command will compress your app built by `gulp build` command.

```bash
gulp package
```

## How to use the extension:

- After installing, access Bowser Configurations > Extensions.
- Click on Options menu, over Environment Marker session.
- Configure your Environments and click on Save button.
