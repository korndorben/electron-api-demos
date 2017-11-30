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
	if (!args) {
		return false
	}
	let mealorderresult = await axios.post('http://nm.etao.cn/api/graphql', {
		query: `query ($id: Int!) { mealorder(id: $id) { id mealcode deskcode supplier { name } created(fmt: "YYYY-MM-DD HH:mm:ss") paymentmethod { name } customer { name nickname } customernotes mealorderdetail { id quantity price total dishattr{ name } dish{ name } } total customertotal } }`,
		operationName: '',
		variables: {
			id: args.id
		},
	})
	let mealorder = mealorderresult.data.data.mealorder[0]
	if (mealorder.paymentstatus === 0) {
		'订单未支付'
		return false
	}
	print(mealorder, '172.18.13.250')
	console.log(mealorder);
})
ipcMain.on('printer.print', (event, args) => {
	let {ip, port, data} = JSON.parse(args);
	print(ip, port, data)
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
		// mainWindow.loadURL(path.join('file://', __dirname, '/index.html'))
		// Launch fullscreen with DevTools open, usage: npm run debug
		mainWindow.maximize()
		if (debug) {
			mainWindow.webContents.openDevTools()
			require('devtron').install()
		}
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
