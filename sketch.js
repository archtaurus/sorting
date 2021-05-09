const WINDOW_WIDTH = 800
const WINDOW_HEIGHT = 400
const TOTAL = 40
const COLUMN_WIDTH = WINDOW_WIDTH / TOTAL
const NUMBERS = new Array(TOTAL)
const DEFAULT = '冒泡排序 Bubble Sort'
const FRAMERATE = -1
let sorter, oscillator, start_time

function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT)
    oscillator = new p5.Oscillator('sine')
    frameRate(FRAMERATE)
    play(DEFAULT)
}

function draw() {
    // 更新数据
    const { value, done } = sorter.next()
    // 绘制数据
    background(200)
    for (let i = 0; i < TOTAL; i++) {
        stroke(200)
        let color = 'black'
        if (value) {
            const index = value.indexOf(i)
            if (index !== -1) color = ['red', 'blue', 'green'][index]
        }
        fill(color)
        rect(i * COLUMN_WIDTH, height - NUMBERS[i], COLUMN_WIDTH, height)
        noStroke()
        fill('white')
        textSize(8)
        textAlign(CENTER)
        text(NUMBERS[i].toFixed(0), i * COLUMN_WIDTH + COLUMN_WIDTH / 2, height - 4)
    }
    if (done) {
        noStroke()
        fill(0)
        textSize(16)
        const time_cost = (Date.now() - start_time) / 1000
        text(`完成时间: ${time_cost} 秒`, 100, 50)
        oscillator.stop()
        noLoop()
    } else if (value) {
        const freq = map(value[0], 0, TOTAL - 1, 256, 2048)
        oscillator.freq(freq, 0.1)
    }
}

function keyPressed() {
    switch (key.toLowerCase()) {
        case 'b': {
            play('冒泡排序 Bubble Sort')
            break
        }
        case 'l': {
            play('快速排序 Quick Sort (Lomuto)')
            break
        }
        case 'h': {
            play('快速排序 Quick Sort (Hoare)')
            break
        }
    }
}

function play(name = '冒泡排序 Bubble Sort') {
    for (let i = 0; i < TOTAL; i++) NUMBERS[i] = random(height)
    document.querySelector('h1').innerText = name
    sorter = sorters[name](NUMBERS)
    start_time = Date.now()
    oscillator.start()
    loop()
}

const sorters = {
    /**
     * 冒泡排序 Bubble Sort
     * @see https://en.wikipedia.org/wiki/Bubble_sort
     */
    '冒泡排序 Bubble Sort': function* bubblesort(list) {
        let n = TOTAL
        while (n > 1) {
            let m = 0
            for (let i = 1; i < n; i++) {
                if (list[i - 1] > list[i]) {
                    ;[list[i - 1], list[i]] = [list[i], list[i - 1]]
                    m = i
                }
                yield [i, m, n]
            }
            n = m
        }
    },

    /**
     * 快速排序 Quick Sort - Lomuto partition scheme
     * @see https://en.wikipedia.org/wiki/Quicksort#Lomuto_partition_scheme
     * @param {Array} array
     * @param {Number} low
     * @param {Number} high
     * @returns {Generator}
     */
    '快速排序 Quick Sort (Lomuto)': function* quickSortLomuto(array, low = 0, high = TOTAL - 1) {
        if (low < high) {
            let pivot = undefined
            const generator = partitionLomuto(array, low, high)
            while (pivot === undefined) {
                const { value, done } = generator.next()
                if (done) pivot = value
                else yield value
            }
            yield* quickSortLomuto(array, low, pivot - 1)
            yield* quickSortLomuto(array, pivot + 1, high)
        }
        /**
         * Lomuto partition scheme
         * @param {Array} array
         * @param {Number} low
         * @param {Number} high
         * @returns {Number} pivot
         */
        function* partitionLomuto(array, low, high) {
            const mid = Math.floor(low + (high - low) / 2)
            if (array[mid] < array[low]) [array[low], array[mid]] = [array[mid], array[low]]
            if (array[high] < array[low]) [array[low], array[high]] = [array[high], array[low]]
            if (array[mid] < array[high]) [array[high], array[mid]] = [array[mid], array[high]]
            let pivot = array[high]
            for (let i = low; i <= high; i++) {
                if (array[i] < pivot) [array[low++], array[i]] = [array[i], array[low]]
                yield [i, low, high]
            }
            ;[array[low], array[high]] = [array[high], array[low]]
            return low
        }
    },

    /**
     * 快速排序 Quick Sort - Hoare partition scheme
     * @see https://en.wikipedia.org/wiki/Quicksort#Hoare_partition_scheme
     * @param {Array} array
     * @param {Number} low
     * @param {Number} high
     * @returns {Generator}
     */
    '快速排序 Quick Sort (Hoare)': function* quickSortHoare(array, low = 0, high = TOTAL - 1) {
        if (low < high) {
            let pivot = undefined
            const generator = partitionHoare(array, low, high)
            while (pivot === undefined) {
                const { value, done } = generator.next()
                if (done) pivot = value
                else yield value
            }
            yield* quickSortHoare(array, low, pivot)
            yield* quickSortHoare(array, pivot + 1, high)
        }
        /**
         * Hoare partition scheme
         * @param {Array} array
         * @param {Number} low
         * @param {Number} high
         * @returns {Number} pivot
         */
        function* partitionHoare(array, low, high) {
            const mid = Math.floor(low + (high - low) / 2)
            const pivot = array[mid]
            while (true) {
                while (low < high && array[low] < pivot) ++low
                while (low < high && array[high] > pivot) --high
                if (low >= high) return high
                ;[array[low], array[high]] = [array[high], array[low]]
                yield [low, high, mid]
            }
        }
    },
}
