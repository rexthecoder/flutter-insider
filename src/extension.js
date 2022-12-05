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



const { default: fetch } = require('node-fetch-commonjs');
//================================== eslint-disable-next-line ==================================================================

const vscode = require('vscode'); // initializing vscode
const KEYBINDING_DISPLAY = require('./constants').KEYBINDING_DISPLAY;
const getHighlightedText = require('./helpers/utils').getHighlightedText;
const customLinksObject = vscode.workspace.getConfiguration().Insider.links;
const widget = require(`./command/widget.js`);
const { default: LanguagesHoverProvider } = require('./hover/provider');



//================================== This is the view for the web interface ======================================================
const getWebviewContent = (uri) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <style>
        body, html
          {
            margin: 0; padding: 0; height: 100%; overflow: hidden; background-color: #fff;
            color: var(--vscode-editor-foreground);
          }
          body.vscode-light {
            color: black;
          }
          
          body.vscode-dark {
            color: white;
          }
          
          body.vscode-high-contrast {
            color: red;
          }
      </style>
    </head>
    <body>
      <iframe width="100%" height="100%" src="${uri}" frameborder="0" style="background: var(--vscode-editor-foreground);" >
        <p>can't display ${widget.link}</p>
      </iframe>
    </body>
    </html>
    `;
  return html;
};


const LANGUAGES_SUPPORT = ['dart'];

//===================================== Getting the user language based on the  vs code config ============================================
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

  // !!console.log(interfaceLang);
  if (configLang !== '') {
    return configLang;
  }
  // @ts-ignore
  if (supportedLangs.includes(interfaceLang)) {
    return interfaceLang;
  }
  return 'en';
};


//========================== linking up the prefer docs based on the user lanaguage::Default language is english(Incase of any fallback) ============================ 
const getURIof = (item = '', lang = 'en') => {
  if (typeof customLinksObject[item] === 'string') {
    // !!console.log(customLinksObject[item]);
    return String(customLinksObject[item]);
  }


  //========================== List of all the docs links needed for the user to view it docs ================================
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

//  ! Environment variables.
const flutterApi = 'https://api.flutter.dev/flutter/index.json';
const docsLink = 'https://api.flutter.dev/flutter/';
const pubApi = 'https://pub.dev/api/search?q=';
const pubDocs = 'https://pub.dev/documentation/';
var flutterData = ''



//=================================== Activating the extension =========================================
const activate = (context) => {

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor == null) {
      return;
    }
  });
  //================================== Configure search ======================================
  const write = vscode.commands.registerCommand('extension.search', async () => {

    const editor = vscode.window.activeTextEditor;


    if (editor == null) {
      return;
    }

    const { languageId, getText, fileName } = editor.document;

    const { selection, highlighted } = getHighlightedText(editor);
    let location = null;
    let line = null;

    // Used for cursor placement
    const startLine = selection.start.line;

    if (!highlighted) {
      let document = editor.document;
      let curPos = editor.selection.active;
      location = document.offsetAt(curPos);
      line = document.lineAt(curPos);
      if (line.isEmptyOrWhitespace) {
        vscode.window.showErrorMessage(`Please select a line with code and enter ${KEYBINDING_DISPLAY()} again`);
        return;
      }
      if (!LANGUAGES_SUPPORT.includes(languageId)) {
        vscode.window.showErrorMessage(`Please select code and enter ${KEYBINDING_DISPLAY()} again`);
        return;
      }
    }

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'Searching documentation',
    }, async () => {

      const searchPromise = new Promise(async (resolve, _) => {
        if (flutterData.length === 0) {
          await getData();
        }

        const text = await widget.excute(flutterData, highlighted);

        resolve('Completed Search');

        if (typeof text !== "undefined") {
          const panel = vscode.window.createWebviewPanel(
            'webDocs',
            `${widget.link}`,
            vscode.ViewColumn.One,
            {
              enableScripts: true,
              retainContextWhenHidden: true,
            }
          );

          panel.webview.html = getWebviewContent(text);
        }
      });

      await searchPromise;

    });
  });


  const openInsider = vscode.commands.registerCommand('extension.openInsider', () => {
    const customMenuItems = Object.getOwnPropertyNames(customLinksObject);

    const defaultMenuItems = ['Material', 'Cupertino', 'Widget', 'FlutterFire', 'Bloc']; // Defaultmenu
    const menuItems = [].concat(defaultMenuItems, customMenuItems);


    //================================== Getting the picked menu item to be displayed inside webview ======================================
    vscode.window.showQuickPick(menuItems).then((selectedMenuItem) => {
      if (selectedMenuItem) {

        const panel = vscode.window.createWebviewPanel(
          'webDocs',
          selectedMenuItem,
          vscode.ViewColumn.One,
          {
            enableScripts: true,
            retainContextWhenHidden: true,
          }
        );

        const lang = getLang();

        const selectedURI = getURIof(selectedMenuItem, lang);
        panel.webview.html = getWebviewContent(selectedURI);
      }
    });
  });

  const languagesProvider = vscode.languages.registerHoverProvider('dart', new LanguagesHoverProvider(),);

  context.subscriptions.push(write, openInsider, languagesProvider);
  context.subscriptions.push(languagesProvider);
};

const getData = async () => {
  try {
    const data = await fetch(flutterApi).then(response => response.json());
    console.log('Data fetched from API.....✔️');
    //  ! Checking if the fetched data is null.
    if (data != null) {
      //  ! Making the data accessable within the project.
      // @ts-ignore
      flutterData = data;
      return;
    }
    return;
  }
  catch (err) {
    return console.log('❌️' + err);
  }
};

//========================================= Where the magic booms ====================================
exports.activate = activate;
