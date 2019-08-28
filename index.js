const fs = require("fs");
const path = require("path");
const ProcessListener = require("./process-listener");
let PatchedProcesses = {}, RenameTimer = null;
function HandleAddedProcess(process) {
	try {
		let XigncodeFolder = path.join(path.dirname(process.path), "XIGNCODE");
		if (!fs.existsSync(XigncodeFolder)) return;
		let x3Tmp = path.join(XigncodeFolder, "tmp");
		if (!fs.existsSync(x3Tmp)) fs.mkdirSync(x3Tmp);
		fs.readdirSync(x3Tmp).forEach(file => {
			deleteFile(x3Tmp + '\\' + file);
		});
		renameFile(XigncodeFolder + "\\x3.xem", x3Tmp + "\\x3.xem");
		renameFile(XigncodeFolder + "\\xcorona.xem", x3Tmp + "\\xcorona.xem");
		fs.copyFileSync(path.join(__dirname, "res/x3.xem"), path.join(XigncodeFolder, "x3.xem"));
		fs.copyFileSync(path.join(__dirname, "res/xcorona.xem"), path.join(XigncodeFolder, "xcorona.xem"));
		PatchedProcesses[process.pid] = true;
		console.log(`[xigncode-bypass] Game client (PID ${process.pid}) detected, bypass installed.`);
		
		if (RenameTimer) clearTimeout(RenameTimer);
		RenameTimer = setTimeout(() => {
			let tmpName = Date.now();
			renameFile(XigncodeFolder + "\\x3.xem", x3Tmp + '\\' + tmpName + "-x3.xem");
			renameFile(XigncodeFolder + "\\xcorona.xem", x3Tmp + '\\' + tmpName + "-xcorona.xem");
			renameFile(x3Tmp + "\\x3.xem", XigncodeFolder + "\\x3.xem");
			renameFile(x3Tmp + "\\xcorona.xem", XigncodeFolder + "\\xcorona.xem");
			RenameTimer = null;
		}, 2000);
	} catch(e) {
	}
}

function HandleRemovedProcess(pid) {
	try{
		delete PatchedProcesses[pid];
	} catch(e) {
	}
}

function deleteFile(filePath) {
	if (fs.existsSync(filePath))
		try {
			fs.unlinkSync(filePath);
		} catch(e) {
		}
}

function renameFile(filePath, toPath) {
	if (fs.existsSync(filePath) && !fs.existsSync(toPath))
		try {
			fs.renameSync(filePath, toPath);
		} catch(e) {
		}
}

module.exports = function XigncodeBypass(region) {
	ProcessListener("TERA.exe", HandleAddedProcess, HandleRemovedProcess, 100);
	deleteFile("C:\\Windows\\xhunter1.sys");
}