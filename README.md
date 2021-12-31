# envmarker
Environment Marker Chrome Extension

Maintainer: [Bertonha](https://github.com/geovanneb)

Official link: [https://chrome.google.com/webstore/detail/environment-marker/ahjhdebcnlgmojdmjnhikhakkghcchkk](https://chrome.google.com/webstore/detail/environment-marker/ahjhdebcnlgmojdmjnhikhakkghcchkk)

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=SRFRGVMAUJB3N&currency_code=BRL&source=url)


From 2022 January 1st onwards, all donations will be sent to GRAACC (https://graacc.org.br), a Brazilian Support Group for Teenagers and Children with Cancer.

> When it comes to IT projects, it is very common having multiple environments: dev, QA, stage, and production. 
All those environments' interfaces are mostly identical, and as a consequence, mistakes may happen very often.
Who had never faced the situation when we intended to do a "little test" thinking it was doing in "dev" and suddenly realized that was in the production environment, and ended up applying a configuration in the wrong environment? After all, screw-ups are easy to happen because the look and feel of those sites are the same except by the discreet URL in the browser address bar. 
That is when the Environment Marker Extension comes into play. The Environment Marker is a free and open-source Chrome extension that allows you to configure the URLs of your project's environments and assign a colored "label" on the corner of the browser window, identifying the environment for you.
No more screw-ups in the production environment!

## Getting Started

```sh
# Please make sure that `gulp` was installed on your system using this command:
npm install --global gulp-cli

# Run npm install:
npm install
```

## gulp tasks

### Build and Package

It will build your app as a result you can have a distribution version of the app in `dist`. Run this command to build your Chrome Extension app.

```bash
gulp build
```

You can also distribute your project with a compressed file using the Chrome Developer Dashboard at Chrome Web Store. This command will compress your app built by `gulp build` command.

```bash
gulp package
```

## How to use the extension:

- After installing, access Bowser Configurations > More Tools > Extensions.
- Click on Options menu, over Environment Marker section.
- Configure your Environments and click on Save button.
