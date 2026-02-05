const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

function activate(context) {
  console.log('RestFlow Activated');

  const openCommand = vscode.commands.registerCommand("restflow.open", () => {
    const panel = vscode.window.createWebviewPanel(
      "restflow",
      "RestFlow",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(context.extensionPath)]
      }
    );

    const onDiskPathCss = vscode.Uri.file(path.join(context.extensionPath, "app.css"));
    const styleUri = panel.webview.asWebviewUri(onDiskPathCss);

    const onDiskPathJs = vscode.Uri.file(path.join(context.extensionPath, "app.js"));
    const scriptUri = panel.webview.asWebviewUri(onDiskPathJs);

    let html = fs.readFileSync(
      path.join(context.extensionPath, "index.html"),
      "utf8"
    );

    html = html.replace("app.css", styleUri.toString());
    html = html.replace("app.js", scriptUri.toString());

    panel.webview.html = html;

    const messageListener = panel.webview.onDidReceiveMessage(message => {
      switch (message.command) {
        case 'alert':
          vscode.window.showInformationMessage(message.text);
          return;
      }
    }, undefined, context.subscriptions);

    panel.onDidDispose(() => {
      messageListener.dispose();
    }, null, context.subscriptions);
  });

  context.subscriptions.push(openCommand);
}

exports.activate = activate;
