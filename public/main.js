// Focus div based on nav button click
const home = document.getElementById("homenav");
const single = document.getElementById("singlenav");
const multi = document.getElementById("multinav");
const guess = document.getElementById("guessnav");

// Flip one coin and show coin image to match result when button clicked
const singleFlip = document.getElementById("singlenav")
singleFlip.addEventListener("click", coinFlip)

async function flipOne() {

    const theURL = document.baseURI + "app/flip/"

    await fetch(theURL)
        .then(function(response) {
            return response.json()
        })
            .then(function(result){
                document.getElementById("single").innerHTML = result.flip
            })
    
}
// Flip multiple coins and show coin images in table as well as summary results
const multFlips = document.getElementById("multinav")
multFlips.addEventListener("click", coinFlips)

async function flipMult() {

    const theURL = document.baseURI + "app/flips/10"

    await fetch(theURL)
        .then(function(response) {
            return response.json()
        })
            .then(function(result){
                document.getElementById("multi").innerHTML = result.raw
            })
    
}

// Enter number and press button to activate coin flip series

// Guess a flip by clicking either heads or tails button
