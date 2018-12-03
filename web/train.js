let [width, height] = [300, 300]
let model,rSlider,gSlider,bSlider
let labelP,lossP
let colorLabels = [
    'red-ish',
    'green-ish',
    'blue-ish',
    'orange-ish',
    'yellow-ish',
    'pink-ish',
    'purple-ish',
    'brown-ish',
    'grey-ish'
]


function getData() {
    return fetch('/koa/data').then(res => res.json())
}

async function setup() {
    createCanvas(width, height)
    background(200, 200, 200)
    rSlider = createSlider(0, 255, 255)
    gSlider = createSlider(0, 255, 255)
    bSlider = createSlider(0, 255, 0)
    lossP = createP('loss')
    labelP = createP('')

    let local_models = await tf.io.listModels();
    console.log(local_models)
    if(Object.keys(local_models).length !== 0) {
        model = await tf.loadModel('localstorage://train_result')
        console.log('use local model')
    }



    let colors = []
    let labels = []
    let data = await getData()
    for (var i = 0; i < data.length; i++) {
        let {r, g, b, label} = data[i]
        let row = [r / 255, g / 255, b / 255]
        colors.push(row)
        labels.push(colorLabels.indexOf(label))
    }
    let xs = tf.tensor2d(colors)
    let labelTensor = tf.tensor1d(labels, 'int32')
    // labelTensor.print()
    let ys = tf.oneHot(labelTensor, 9)
    // xs.print()
    // ys.print()
    if(!model) {
        defineModel()
        train(xs, ys)
    }
}

function defineModel() {
    model = tf.sequential()
    let hidden = tf.layers.dense({
        units: 16,
        activation: 'sigmoid',
        inputDim: 3,
    })
    let output = tf.layers.dense({
        units: 9,
        activation: 'softmax'
    })
    model.add(hidden)
    model.add(output)
    const lr = 0.2
    const optimizer = tf.train.sgd(lr)
    model.compile({
        optimizer: optimizer,
        loss: 'categoricalCrossentropy',
    })
}

async function train(xs, ys) {
    let options = {
        epochs: 10,
        validationData: 0.1,
        shuffle: true,
        callbacks: {
            onTrainBegin: () => console.log("train begin"),
            onTrainEnd: () => console.log('train end'),
            onBatchEnd: tf.nextFrame,
            onEpochEnd: (num, logs) => {
                model.save('localstorage://train_result');
                console.log('Epoch: ', num)
                // console.log('Loss: ',logs.loss)
                lossP.html('Loss: ' + logs.loss)
            }
        }
    }
    return await model.fit(xs, ys, options).then(res => {
        console.log(res.history.loss)
    })
}

function draw() {
    let r = rSlider.value()
    let g = gSlider.value()
    let b = bSlider.value()
    background(r, g, b)

    const xs = tf.tensor2d([[
        r / 255,
        g / 255,
        b / 255
    ]])
    if(model) {
        tf.tidy(() => {
            let results = model.predict(xs)
            let index = results.argMax(1).dataSync()
            labelP.html(colorLabels[index])
        })
    }
    
    // stroke(255)
    // strokeWeight(4)
    // line(frameCount % width, 0,frameCount % width,height)
}