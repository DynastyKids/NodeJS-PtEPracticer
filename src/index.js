const { app , BrowserWindow } = require('electron');
const path = require('path');


if (require('electron-squirrel-startup')) {
	app.quit();
}

function createWindow () {
	const mainWindow = new BrowserWindow({
		width: 1152,
		height: 864,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: true,
  			enableRemoteModule:true,
 			contextIsolation:false
		},
	});

	mainWindow.loadFile(path.join(__dirname, 'index.html'));
	// mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

