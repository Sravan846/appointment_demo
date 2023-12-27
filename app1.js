const player2 = ['C-7', 'D-13', 'C-9', 'D-14', 'C-10'];
let a=[...player2]

const sortAlphaNum = (a, b) => a.localeCompare(b, 'en', { numeric: true })
console.log(a.sort(sortAlphaNum))
console.log('player2', player2)
