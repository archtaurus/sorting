const WINDOW_WIDTH = 800
const WINDOW_HEIGHT = 400
const TOTAL = 40
const COLUMN_WIDTH = WINDOW_WIDTH / TOTAL
const NUMBERS = new Array(TOTAL)
let sorter, oscillator, start_time

function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT)
    oscillator = new p5.Oscillator('sine')
    textAlign(CENTER)
    textSize(8)
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
    background(200)
    for (let i = 0; i < TOTAL; i++) {
        stroke(200)
        fill(value === i ? 'red' : 'black')
        rect(i * COLUMN_WIDTH, height - NUMBERS[i], COLUMN_WIDTH, height)
        stroke(0)
        fill('white')
        text(NUMBERS[i].toFixed(0), i * COLUMN_WIDTH + COLUMN_WIDTH / 2, height - 4)
    }
}

function keyPressed() {
    switch (key.toLowerCase()) {
        case 'b': {
            play('冒泡排序 Bubble Sort')
            break
        }
        case 'l': {
            play('快速排序 Quick Sort 1')
            break
        }
        case 'q': {
            play('快速排序 Quick Sort 2')
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
    },

    /* Lomuto partition scheme */
    '快速排序 Quick Sort 1': function* quicksort(low = 0, high = TOTAL - 1) {
        function* partition(low, high) {
            const mid = Math.floor((low + high) / 2)
            if (NUMBERS[mid] < NUMBERS[low]) [NUMBERS[low], NUMBERS[mid]] = [NUMBERS[mid], NUMBERS[low]]
            if (NUMBERS[high] < NUMBERS[low]) [NUMBERS[low], NUMBERS[high]] = [NUMBERS[high], NUMBERS[low]]
            if (NUMBERS[mid] < NUMBERS[high]) [NUMBERS[high], NUMBERS[mid]] = [NUMBERS[mid], NUMBERS[high]]
            let pivot = NUMBERS[high]
            for (let i = low; i <= high; i++) {
                if (NUMBERS[i] < pivot) {
                    ;[NUMBERS[low], NUMBERS[i]] = [NUMBERS[i], NUMBERS[low]]
                    yield ++low
                }
            }
            ;[NUMBERS[low], NUMBERS[high]] = [NUMBERS[high], NUMBERS[low]]
            return low
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
    },

    /* Hoare partition scheme */
    '快速排序 Quick Sort 2': function* quicksort(low = 0, high = TOTAL - 1) {
        function* partition(low, high) {
            let pivot = NUMBERS[Math.floor((low + high) / 2)]
            while (true) {
                while (low < high && NUMBERS[low] < pivot) ++low
                while (low < high && NUMBERS[high] > pivot) --high
                if (low >= high) return high
                ;[NUMBERS[low], NUMBERS[high]] = [NUMBERS[high], NUMBERS[low]]
                yield high
            }
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
            yield* quicksort(low, pivot)
            yield* quicksort(pivot + 1, high)
        }
    },
}
