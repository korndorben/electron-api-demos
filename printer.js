var iconv = require("iconv-lite");
const net = require('net');
const os = require('os');
const moment = require('moment');
const portscanner = require('portscanner')
//--------------ok
//------------门店名称
function print({
	ipaddress,
	port = 9100,
	data = {},
}) {
	const client = net.createConnection(port/1, ip, function() {})
	client.on('connect', function() {
		console.log('connected');
		//48
		client.write(Buffer.from(data,'base64'))
		// client.write(Buffer.from([0x1d, 0x56, 0x00,])); //切纸
		client.end();
	})
	client.on('error', function(err) {
		console.log(err);
	})
	client.on('data', function() {})
	client.on('end', function() {})
	client.on('close', function() {})
}
// print('192.168.0.202',9100)
function scan(cb) {
	let localnetworks = ipaddress()
	for (let localnetwork of localnetworks) {
		for (let i = 1; i <= 255; i++) {
			let arr = (localnetwork.address || '192.168.0.1').split('.');
			arr[3] = i
			let printer_ipaddress = arr.join('.')
			portscanner.checkPortStatus(9100, printer_ipaddress, function(error, status) {
				if ('open' == status) {
					cb && cb({ip: printer_ipaddress, port: 9100, status: status,})
				}
			})
		}
	}
}
function ipaddress() {
	var networkInterfaces = os.networkInterfaces();
	let ipaddresses = []
	for (let prop of Object.keys(networkInterfaces)) {
		for (let ipaddress of networkInterfaces[prop]) {
			if (ipaddress.internal || ipaddress.family.toUpperCase() == 'IPV6') {
				continue
			}
			ipaddresses.push(ipaddress)
		}
	}
	return ipaddresses
};
// printImageEpson: function(image, callback) {
// 	let png = new PNG({filterType: 4});
// 	fs.createReadStream(image).pipe(png).on('parsed', function() {
// 		module.exports._printImageBufferEpson(this.width, this.height, this.data, function(buff) {
// 			callback(buff);
// 		});
// 	}).on('error', function(err) {
// 		console.error(err);
// 	});
// },
// _printImageBufferEpson: function(width, height, data, callback) {
//   Get pixel rgba in 2D array
// 	var pixels = [];
// 	for (var i = 0; i < height; i++) {
// 		var line = [];
// 		for (var j = 0; j < width; j++) {
// 			var idx = (width * i + j) << 2;
// 			line.push({
// 				r: data[idx],
// 				g: data[idx + 1],
// 				b: data[idx + 2],
// 				a: data[idx + 3],
// 			});
// 		}
// 		pixels.push(line);
// 	}
// 	var imageBuffer_array = [];
// 	for (var i = 0; i < height; i++) {
// 		for (var j = 0; j < Math.ceil(width / 8); j++) {
// 			var byte = 0x0;
// 			for (var k = 0; k < 8; k++) {
// 				var pixel = pixels[i][j * 8 + k];
// 			  Image overflow
// 				if (pixel === undefined) {
// 					pixel = {
// 						a: 0,
// 						r: 0,
// 						g: 0,
// 						b: 0,
// 					};
// 				}
// 				if (pixel.a > 126) {  checking transparency
// 					var grayscale = parseInt(0.2126 * pixel.r + 0.7152 * pixel.g + 0.0722 * pixel.b);
// 					if (grayscale < 128) {  checking color
// 						var mask = 1 << 7 - k;  setting bitwise mask
// 						byte |= mask;  setting the correct bit to 1
// 					}
// 				}
// 			}
// 			imageBuffer_array.push(byte);
// 		  imageBuffer = Buffer.concat([imageBuffer, new Buffer([byte])]);
// 		}
// 	}
// 	let imageBuffer = Buffer.from(imageBuffer_array);
//   Print raster bit image
//   GS v 0
//   1D 76 30	m	xL xH	yL yH d1...dk
//   xL = (this.width >> 3) & 0xff;
//   xH = 0x00;
//   yL = this.height & 0xff;
//   yH = (this.height >> 8) & 0xff;
//   https://reference.epson-biz.com/modules/ref_escpos/index.php?content_id=94
//   Check if width/8 is decimal
// 	if (width % 8 != 0) {
// 		width += 8;
// 	}
// 	append(new Buffer([0x1d, 0x76, 0x30, 48,]));
// 	append(new Buffer([(width >> 3) & 0xff]));
// 	append(new Buffer([0x00]));
// 	append(new Buffer([height & 0xff]));
// 	append(new Buffer([(height >> 8) & 0xff]));
//   append data
// 	append(imageBuffer);
//   Don't forget to clean the buffer
// 	let buff = buffer;
// 	buffer = null;
// 	callback(buff);
// 	return buff;
// }
module.exports = {
	ipaddress,
	scan,
	print,
};
// scan(function(a) {
//     console.log(a);
// })
