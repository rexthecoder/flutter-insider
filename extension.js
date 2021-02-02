/**  
  Copyright [2021] [Rexford Asamoah]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

Object.defineProperty(exports, '__esModule', {
  value: true,
});
// eslint-disable-next-line
const vscode = require('vscode'); // подключаем библиотеку vscode
const customLinksObject = vscode.workspace.getConfiguration().Insider.links;

// This is the view for the web interface
const getWebviewContent = (uri) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <style>
        body, html
          {
            margin: 0; padding: 0; height: 100%; overflow: hidden; background-color: #fff;
          }
      </style>
    </head>
    <body>
      <iframe width="100%" height="100%" src="${uri}" frameborder="0">
        <p>can't display ${uri}</p>
      </iframe>
    </body>
    </html>
    `;
  return html;
};

// Getting the user language based on the  vs codee config
const getLang = () => {
  const supportedLangs = ['ru', 'en', 'zh'];
  const configLang = vscode.workspace.getConfiguration().Insider.lang;
  /* eslint "no-nested-ternary": 0 */
  const interfaceLang = vscode.env.language.includes('ru')
    ? 'ru'
    : vscode.env.language.includes('en')
      ? 'en'
      : vscode.env.language.includes('zh')
        ? 'zh'
        : null;

  // console.log(interfaceLang);
  if (configLang !== '') {
    return configLang;
  }
  // @ts-ignore
  if (supportedLangs.includes(interfaceLang)) {
    return interfaceLang;
  }
  return 'en';
};

//linking up the prefer docs based on the user lanaguage::Default language is english(Incase of any fallback)  
const getURIof = (item = '', lang = 'en') => {
  if (typeof customLinksObject[item] === 'string') {
    // console.log(customLinksObject[item]);
    return String(customLinksObject[item]);
  }
 
  // List of all the docs links needed for the user to view it docs
  // TODO: Swip all the link  based on the language
  const URIof = {
    Material: {
      en: 'https://api.flutter.dev/flutter/material/material-library.html',
      ru: 'https://api.flutter.dev/flutter/material/material-library.html',
      zh: 'https://api.flutter.dev/flutter/material/material-library.html',
    },
    Cupertino: {
      en: 'https://api.flutter.dev/flutter/cupertino/cupertino-library.html',
      ru: 'https://api.flutter.dev/flutter/cupertino/cupertino-library.html',
      zh: 'https://api.flutter.dev/flutter/cupertino/cupertino-library.html',
    },
    'Widget': {
      en: 'https://api.flutter.dev/flutter/widgets/widgets-library.html',
      ru: 'https://api.flutter.dev/flutter/widgets/widgets-library.html',
      zh: 'https://api.flutter.dev/flutter/widgets/widgets-library.html',
    },
    'FlutterFire': {
      en: 'https://firebase.flutter.dev',
      ru: 'https://firebase.flutter.dev',
      zh: 'https://firebase.flutter.dev',
    },
    'Bloc': {
      en: 'https://bloclibrary.dev/#/',
      ru: 'https://bloclibrary.dev/#/',
      zh: 'https://bloclibrary.dev/#/',
    },
  };
  return String(URIof[item][lang]);
};


//Activating the extension
const activate = (context) => {
  const openInsider = vscode.commands.registerCommand('extension.openInsider', () => {
    const customMenuItems = Object.getOwnPropertyNames(customLinksObject);

    const defaultMenuItems = ['Material', 'Cupertino', 'Widget', 'FlutterFire', 'Bloc']; // Defaultmenu
    const menuItems = [].concat(defaultMenuItems, customMenuItems);



    vscode.window.showQuickPick(menuItems).then((selectedMenuItem) => {
      if (selectedMenuItem) {

        const panel = vscode.window.createWebviewPanel(
          'webDocs',
          selectedMenuItem,
          vscode.ViewColumn.One,
          {

            // https://code.visualstudio.com/docs/extensions/webview#_scripts-and-message-passing
            enableScripts: true,


            // https://code.visualstudio.com/docs/extensions/webview#_persistence
            retainContextWhenHidden: true,
          }
        );

        const lang = getLang();

        const selectedURI = getURIof(selectedMenuItem, lang);
        panel.webview.html = getWebviewContent(selectedURI);
      }
    });
  });

  context.subscriptions.push(openInsider);
};

exports.activate = activate;
