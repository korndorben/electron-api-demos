const axios = require('axios');
const {ipaddress, scan, print,} = require('./printer.js');
const path = require('path')
const glob = require('glob')
const electron = require('electron')
const autoUpdater = require('./auto-updater')
const BrowserWindow = electron.BrowserWindow
const app = electron.app
const debug = /--debug/.test(process.argv[2])
if (process.mas)
	app.setName('易淘商家管理后台')
	//打印机通讯
const {ipcMain} = require('electron')
ipcMain.on('mealorderupdated', async (event, args) => {
	console.log('mealorderupdated.args');
	console.log(args);
	let printerdata = await axios.post('http://nm.etao.cn/api/graphql', {
		query: `query($id:Int!){ forprinter(id:$id) { ip port data repetition } }`,
		operationName: '',
		variables: {
			id: args.id
		},
	})
	console.log('printerdata');
	console.log(printerdata.data.data.forprinter);
	if (printerdata.data.data.forprinter.length <= 0) {
		return false
	}
	for (tobeprint of printerdata.data.data.forprinter) {
		let {ip, port, data,repetition} = tobeprint
		print({ip, port, data,repetition})
	}
	// console.log(mealorder);
})
ipcMain.on('printer.print', (event, args) => {
	let {ip, port, data} = JSON.parse(args);
	print({ip, port, data})
})
ipcMain.on('printer.init', (event, args) => {
	scan(function(result) {
		mainWindow.webContents.send('printer.init', result)
	})
})
//打印机通讯结束
var mainWindow = null
function initialize() {
	var shouldQuit = makeSingleInstance()
	if (shouldQuit)
		return app.quit()
	loadDemos()
	function createWindow() {
		var windowOptions = {
			width: 1080,
			minWidth: 680,
			height: 840,
			title: app.getName(),
		}
		if (process.platform === 'linux') {
			windowOptions.icon = path.join(__dirname, '/assets/app-icon/png/512.png')
		}
		mainWindow = new BrowserWindow(windowOptions)
		mainWindow.loadURL(`http://nbw.b.etao.cn`)
		// mainWindow.once('ready-to-show', () => {
		// 	mainWindow.show()
		// })
		// mainWindow.loadURL(path.join('file://', __dirname, '/index.html'))
		// Launch fullscreen with DevTools open, usage: npm run debug
		mainWindow.maximize();
		mainWindow.on('closed', function() {
			mainWindow = null
		})
	}
	app.on('ready', function() {
		createWindow()
		autoUpdater.initialize()
	})
	app.on('window-all-closed', function() {
		if (process.platform !== 'darwin') {
			app.quit()
		}
	})
	app.on('activate', function() {
		if (mainWindow === null) {
			createWindow()
		}
	})
}
// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance() {
	if (process.mas)
		return false
	return app.makeSingleInstance(function() {
		if (mainWindow) {
			if (mainWindow.isMinimized())
				mainWindow.restore()
			mainWindow.focus()
		}
	})
}
// Require each JS file in the main-process dir
function loadDemos() {
	var files = glob.sync(path.join(__dirname, 'main-process/**/*.js'))
	files.forEach(function(file) {
		require(file)
	})
	autoUpdater.updateMenu()
}
// Handle Squirrel on Windows startup events
switch (process.argv[1]) {
	case '--squirrel-install':
		autoUpdater.createShortcut(function() {
			app.quit()
		})
		break
	case '--squirrel-uninstall':
		autoUpdater.removeShortcut(function() {
			app.quit()
		})
		break
	case '--squirrel-obsolete':
	case '--squirrel-updated':
		app.quit()
		break
	default:
		initialize()
}
