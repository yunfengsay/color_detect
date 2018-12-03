let r,g,b;
let [width, height] = [600,600]
let step = 10

let color = (r,g,b) => `rgb(${r},${g},${b})`
let label = 'grey-ish'
let colorLabels = {
	'red-ish': [],
	'green-ish': [],
	'blue-ish': [],
	'orange-ish': [],
	'yellow-ish': [],
	'pink-ish': [],
	'purple-ish': [],
	'brown-ish': [],
	'grey-ish': []
}

function pickColor() {
	r = Math.floor(random(256))
	g = Math.floor(random(256))
	b = Math.floor(random(256))
	background(r,g,b)
}

function setup() {
	
	createCanvas(width,height)
	// pickColor()
	background(200,200,200)
	let buttons = []
	for(let i in colorLabels) {
		buttons.push(createButton(i))
	}
	getData().then(data => {
		for(let i = 0; i< data.length;i++) {
			
			colorLabels[data[i].label].push(data[i])
		}
		let [x,y] = [0,0]
		let special_label_data = colorLabels[label]
		for(let i = 0;i < special_label_data.length; i++ ) {
			let {r,g,b} = special_label_data[i]
			fill(color(r,g,b))
			rect(x, y, step,step)
			x += step;
			if(x >= width ) {
				x = 0
				y += step
			}
		}
		createDiv(label + ' ' + colorLabels[label].length)
	})
}


function mousePressed() {
	let i = floor(mouseX / step)
	let j = floor(mouseY / step)
	let index = i + j*(width/step)
	let item = colorLabels[label][index]
	console.log(item)
	delData(item)
}

function getData() {
	return fetch('/koa/data').then(res => res.json())
}
function delData(data) {
	return fetch(`/koa/del`, {
		body: JSON.stringify(data),
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		}
	}).then(res => res.json())
	.then(res => console.log(res))
}