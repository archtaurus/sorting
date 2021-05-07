const WINDOW_WIDTH = 800
const WINDOW_HEIGHT = 400
const TOTAL = 100
const COLUMN_WIDTH = WINDOW_WIDTH / TOTAL
const NUMBERS = new Array(TOTAL)
let sorter, oscillator, start_time

function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT)
    oscillator = new p5.Oscillator('sine')
    play()
}

function draw() {
    // 更新数据
    const { value, done } = sorter.next()
    if (done) {
        const time_cost = (Date.now() - start_time) / 1000
        document.querySelector('h1').innerText += ` (完成时间: ${time_cost} 秒)`
        oscillator.stop()
        noLoop()
    } else {
        const freq = map(value, 0, TOTAL - 1, 256, 2048)
        oscillator.freq(freq, 0.1)
    }
    // 绘制数据
    fill(0)
    stroke(200)
    background(200)
    for (let i = 0; i < TOTAL; i++) rect(i * COLUMN_WIDTH, height - NUMBERS[i], COLUMN_WIDTH, height)
}

function keyPressed() {
    switch (key.toLowerCase()) {
        case 'b': {
            play('冒泡排序 Bubble Sort')
            break
        }
        case 'q': {
            play('快速排序 Quick Sort')
            break
        }
    }
}

function play(name = '冒泡排序 Bubble Sort') {
    for (let i = 0; i < NUMBERS.length; i++) NUMBERS[i] = random(height)
    document.querySelector('h1').innerText = name
    sorter = sorters[name]()
    start_time = Date.now()
    oscillator.start()
    loop()
}

const sorters = {
    '冒泡排序 Bubble Sort': function* bubblesort() {
        let n = TOTAL
        while (n > 1) {
            let m = 0
            for (let i = 1; i < n; i++) {
                if (NUMBERS[i - 1] > NUMBERS[i]) {
                    ;[NUMBERS[i - 1], NUMBERS[i]] = [NUMBERS[i], NUMBERS[i - 1]]
                    yield (m = i)
                }
            }
            n = m
        }
        return
    },
    '快速排序 Quick Sort': function* quicksort(low = 0, high = TOTAL - 1) {
        function* partition(low, high) {
            let i = low
            let pivot = NUMBERS[high]
            for (let j = low; j <= high; j++) {
                if (NUMBERS[j] < pivot) {
                    ;[NUMBERS[i], NUMBERS[j], i] = [NUMBERS[j], NUMBERS[i], i + 1]
                    yield i
                }
            }
            ;[NUMBERS[i], NUMBERS[high]] = [NUMBERS[high], NUMBERS[i]]
            return i
        }
        if (low < high) {
            let pivot
            const generator = partition(low, high)
            while (true) {
                const { value, done } = generator.next()
                if (done) {
                    pivot = value
                    break
                } else yield value
            }
            yield* quicksort(low, pivot - 1)
            yield* quicksort(pivot + 1, high)
        }
        return
    },
}
